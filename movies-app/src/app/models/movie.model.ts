// src/app/models/movie.model.ts
export interface Movie {
id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  vote_average: number;
  popularity: number;
  genre_ids?: number[];        // en listados
  genres?: { id:number; name:string }[]; // en /movie/:id
  // enriquecidos
  genreNames?: string[];      
  source?: 'tmdb' | 'db';    
}

export interface TmdbPaged<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}


export interface TmdbGenre { id: number; name: string; }
export interface TmdbGenreResponse { genres: TmdbGenre[]; }