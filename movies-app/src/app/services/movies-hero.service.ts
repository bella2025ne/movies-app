// src/app/services/movies-hero.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';
import { map, Observable } from 'rxjs';

type MovieItem = {
  id: number;
  title?: string;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
};

@Injectable({ providedIn: 'root' })
export class MoviesHeroService {
  private api = environment.tmdb.apiBase;
  private key = environment.tmdb.apiKey;
  private img = environment.tmdb.imageBackdropBase;

  constructor(private http: HttpClient) {}

  /** Mejores películas para hero (popular o top_rated) */
  getBackdrops(limit = 20, lang = 'es-AR', source: 'popular'|'top' = 'popular'):
    Observable<{url:string; title:string; avg:number; overview:string}[]> {
    const endpoint = source === 'top' ? '/movie/top_rated' : '/movie/popular';
    const params = new HttpParams().set('api_key', this.key).set('language', lang);

    return this.http.get<{ results: MovieItem[] }>(`${this.api}${endpoint}`, { params })
      .pipe(
        map(r => r.results
          .filter(x => !!x.backdrop_path)
          .sort((a,b) => b.vote_average - a.vote_average)
          .slice(0, limit)
          .map(m => ({
            url: `${this.img}${m.backdrop_path}`,
            title: m.title ?? '—',
            avg: m.vote_average,
            overview: m.overview
          }))
        )
      );
  }
}

