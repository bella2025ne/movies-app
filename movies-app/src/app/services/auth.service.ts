import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private logged = false;
  login(email: string, pass: string) { return this.logged = !!email && !!pass; }
  isAuthenticated() { return this.logged; }
  logout() { this.logged = false; }
}
