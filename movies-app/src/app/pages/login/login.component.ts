// src/app/pages/login/login.component.ts
import { Component, OnDestroy, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MoviesHeroService } from '../../services/movies-hero.service';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

type Tile = { url: string; w: number; h: number; title?: string };

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  hide = true;
  loading = false;
  form!: FormGroup;

  // estado de fondo
  private imgs: string[] = [];
  private timer?: any;
  private idx = 0;

  aUrl = signal<string>(''); // capa A
  bUrl = signal<string>(''); // capa B
  showA = signal<boolean>(true);

  private images = signal<string[]>([]);
  tiles = computed<Tile[]>(() => this.buildTiles(this.images()));

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private sb: MatSnackBar,
    private movies: MoviesHeroService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.movies.getBackdrops(24, 'es-AR', 'top').subscribe((m) => {
      const urls = this.shuffle([...m.map((x) => x.url)]);
      this.images.set(urls.slice(0, 60)); // recorto a 60 para el mosaico
      // Preload básico
      urls.slice(0, 60).forEach((u) => {
        const img = new Image();
        img.src = u;
      });
    });
  }
  bgCss = (url: string) => (url ? `url('${url}')` : 'none');

  bg = (u: string) => (u ? `url('${u}')` : 'none');

  // Patrón de tamaños (ancho x alto) en “spans” de la grid (se repite)
  private pattern: Array<[number, number]> = [
    [4, 2],
    [2, 2],
    [3, 2],
    [2, 3],
    [3, 3],
    [2, 2],
    [5, 3],
    [3, 2],
    [2, 2],
    [4, 3],
    [2, 2],
    [3, 2],
  ];

  /** Construye tiles repetando el pattern sobre la lista de imágenes */
  private buildTiles(urls: string[]): Tile[] {
    const tiles: Tile[] = [];
    for (let i = 0; i < urls.length; i++) {
      const [w, h] = this.pattern[i % this.pattern.length];
      tiles.push({ url: urls[i], w, h });
    }
    return tiles;
  }

  /** Fisher–Yates shuffle */
  private shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  private startCycle(intervalMs = 6000) {
    this.stopCycle();
    this.timer = setInterval(() => {
      this.idx = (this.idx + 1) % this.imgs.length;
      const next = this.imgs[this.idx];

      // alternar capas para hacer cross-fade
      if (this.showA()) {
        this.bUrl.set(next);
        this.showA.set(false); // aparece B
      } else {
        this.aUrl.set(next);
        this.showA.set(true); // aparece A
      }
    }, intervalMs);
  }

  private stopCycle() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private preloadAll(urls: string[]) {
    urls.forEach((u) => {
      const img = new Image();
      img.src = u;
    });
  }
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    setTimeout(() => {
      const ok = this.auth.login(this.form.value.email!, this.form.value.password!);
      this.loading = false;
      if (ok) {
        this.sb.open('Bienvenido/a', 'OK', { duration: 1400 });
        this.router.navigate(['/home']);
      } else {
        this.sb.open('Credenciales inválidas', 'Cerrar', { duration: 2400 });
      }
    }, 500);
  }

  ngOnDestroy(): void {
    this.stopCycle();
  }

  ngAfterViewInit() {
    // valores del grid: 20 columnas y cada tile ocupa 4 → 5 tiles por fila
    const COLS = 20;
    const TILE_W = 4;
    const perRow = Math.floor(COLS / TILE_W); // 5

    // marcamos como .brick-offset los de filas pares
    const tiles = Array.from(document.querySelectorAll<HTMLElement>('.tiles .tile'));
    tiles.forEach((el, i) => {
      const row = Math.floor(i / perRow); // 0,1,2...
      if (row % 2 === 1) el.classList.add('brick-offset');
    });
  }
}
