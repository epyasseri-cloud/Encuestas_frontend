import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private api: ApiService, private auth: AuthService) {}

  async canActivate(): Promise<boolean> {
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigateByUrl('/home');
      return false;
    }

    try {
      // validate token by calling a protected endpoint
      await this.api.get('users/me');
      return true;
    } catch (err) {
      this.auth.clearAll();
      this.router.navigateByUrl('/home');
      return false;
    }
  }
}
