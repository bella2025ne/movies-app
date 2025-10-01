// src/app/models/movie.model.ts
export interface Movie {
  id: number;
  title: string;              // para TV sería 'name'
  overview: string;
  poster_path: string | null; // concatenar con imageBase
  release_date?: string;
  vote_average: number;       // 0..10
  popularity: number;         // “más buscadas” ~ popularidad
}

export interface TmdbPaged<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
