import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';
import { Observable, map } from 'rxjs';
import { Movie, TmdbPaged } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private api = environment.tmdb.apiBase;
  private key = environment.tmdb.apiKey;
  private img = environment.tmdb.imageBase;

  constructor(private http: HttpClient) {}

  popularMovies(page = 1, lang = 'es-AR'): Observable<Movie[]> {
    const params = new HttpParams()
      .set('api_key', this.key)
      .set('language', lang)
      .set('page', String(page));
    return this.http.get<TmdbPaged<Movie>>(`${this.api}/movie/popular`, { params }).pipe(
      map(res => res.results
        .filter(m => m.poster_path)
        .map(m => ({ ...m, poster_path: m.poster_path ? `${this.img}${m.poster_path}` : null }))
      )
    );
  }

  searchMovies(query: string, page = 1, lang = 'es-AR'): Observable<Movie[]> {
    const params = new HttpParams()
      .set('api_key', this.key)
      .set('language', lang)
      .set('query', query)
      .set('page', String(page))
      .set('include_adult', 'false');
    return this.http.get<TmdbPaged<Movie>>(`${this.api}/search/movie`, { params }).pipe(
      map(res => res.results
        .filter(m => m.poster_path)
        .map(m => ({ ...m, poster_path: m.poster_path ? `${this.img}${m.poster_path}` : null }))
      )
    );
  }
}