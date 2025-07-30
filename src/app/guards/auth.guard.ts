import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url },
        replaceUrl: true
      });
      return false;
    }

    // Check if route requires specific role
    const requiredRole = route.data?.['role'];
    if (requiredRole) {
      return this.authService.currentUser$.pipe(
        take(1),
        map(user => {
          if (!user || !this.authService.hasMinimumRole(requiredRole)) {
            this.router.navigate(['/access-denied']);
            return false;
          }
          return true;
        })
      );
    }

    return true;
  }
}