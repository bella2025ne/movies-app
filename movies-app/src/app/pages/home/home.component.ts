// src/app/pages/home/home.component.ts
import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { TmdbService } from '../../services/tmdb.service';
import { Movie } from '../../models/movie.model';
import { CardComponent } from '../../shared/components/card.component';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';

type SortKey = 'pop' | 'rating' | 'date';
type SortDir = 'desc' | 'asc';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    CardComponent,
    MatToolbarModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatGridListModule, MatTooltipModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  loading = false;
  movies: Movie[] = [];

  // UI controls
  q = new FormControl('', { nonNullable: true });
  sortKey = new FormControl<SortKey>('pop', { nonNullable: true });
  sortDir = new FormControl<SortDir>('desc', { nonNullable: true });

  constructor(private tmdb: TmdbService) {}

  ngOnInit(): void {
    this.fetchPopular();

    this.q.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(text => {
      if (!text.trim()) { this.fetchPopular(); return; }
      this.search(text);
    });
  }

  private fetchPopular() {
    this.loading = true;
    this.tmdb.popularMovies().subscribe(list => {
      this.movies = this.sortClient(list);
      this.loading = false;
    });
  }

  private search(text: string) {
    this.loading = true;
    this.tmdb.searchMovies(text).subscribe(list => {
      this.movies = this.sortClient(list);
      this.loading = false;
    });
  }

  applySort() {
    this.movies = this.sortClient(this.movies.slice());
  }

  private sortClient(list: Movie[]): Movie[] {
    const k = this.sortKey.value;
    const d = this.sortDir.value;
    const dir = d === 'desc' ? -1 : 1;
    return list.sort((a,b) => {
      let av = 0, bv = 0;
      if (k === 'pop')    { av = a.popularity;     bv = b.popularity; }
      if (k === 'rating') { av = a.vote_average;   bv = b.vote_average; }
      if (k === 'date')   { av = Date.parse(a.release_date || '1970-01-01'); bv = Date.parse(b.release_date || '1970-01-01'); }
      return av < bv ? 1*dir : av > bv ? -1*dir : 0;
    });
  }
}
