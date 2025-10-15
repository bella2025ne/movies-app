// src/app/services/tmdb.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';
import { Observable, map, shareReplay, switchMap } from 'rxjs';
import { Movie, TmdbPaged, TmdbGenreResponse } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private api = environment.tmdb.apiBase;
  private key = environment.tmdb.apiKey;
  private img = environment.tmdb.imageBase;

  // cache de géneros (se pide 1 sola vez)
  private genres$?: Observable<Map<number, string>>;

  constructor(private http: HttpClient) {}

  private params(extra: Record<string, string> = {}) {
    let p = new HttpParams().set('api_key', this.key).set('language', 'es-AR');
    Object.entries(extra).forEach(([k, v]) => p = p.set(k, v));
    return p;
  }

  /** Trae /genre/movie/list y lo deja como Map id->name */
  getGenreMap(): Observable<Map<number, string>> {
    if (!this.genres$) {
      this.genres$ = this.http
        .get<TmdbGenreResponse>(`${this.api}/genre/movie/list`, { params: this.params() })
        .pipe(
          map(r => new Map(r.genres.map(g => [g.id, g.name]))),
          shareReplay(1)
        );
    }
    return this.genres$;
  }

  /** Mapea poster completo + genreNames y marca source=tmdb */
  private enrich(list: Movie[], gmap: Map<number, string>): Movie[] {
    return list
      .filter(m => !!m.poster_path)
      .map(m => {
        const genreNames =
          m.genre_ids?.map(id => gmap.get(id)).filter(Boolean) as string[] ||
          m.genres?.map(g => g.name) || [];
        return {
          ...m,
          poster_path: m.poster_path ? `${this.img}${m.poster_path}` : null,
          genreNames,
          source: 'tmdb' as const
        };
      });
  }

  popularMovies(page = 1): Observable<Movie[]> {
    return this.getGenreMap().pipe(    
      map(gmap => ({ gmap })),switchMap(({ gmap }) =>
        this.http.get<TmdbPaged<Movie>>(`${this.api}/movie/popular`, { params: this.params({ page: String(page) }) })
          .pipe(map(res => this.enrich(res.results, gmap)))
      )
    );
  }

  searchMovies(query: string, page = 1): Observable<Movie[]> {
    return this.getGenreMap().pipe(
      map(gmap => ({ gmap })),
      // @ts-ignore
      switchMap(({ gmap }) =>
        this.http.get<TmdbPaged<Movie>>(`${this.api}/search/movie`, {
          params: this.params({ query, page: String(page), include_adult: 'false' })
        }).pipe(map(res => this.enrich(res.results, gmap)))
      )
    );
  }

  byId(id: number): Observable<Movie | null> {
    return this.getGenreMap().pipe(
      map(gmap => ({ gmap })),
      // @ts-ignore
      switchMap(({ gmap }) =>
        this.http.get<Movie>(`${this.api}/movie/${id}`, { params: this.params() })
          .pipe(map(m => this.enrich([m], gmap)[0] ?? null))
      )
    );
  }
}
