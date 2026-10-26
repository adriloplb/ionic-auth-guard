import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService, UserRole } from '../services/auth';

export const roleGuard = (allowedRole: UserRole): CanActivateFn => {
  return (route, state): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentRole = authService.userRole();

    // Si el usuario coincide con el rol requerido, permite el acceso
    if (currentRole === allowedRole) {
      return true;
    }

    // Denegación de acceso y redirección inteligente al panel adecuado
    if (currentRole === 'user') {
      return router.createUrlTree(['/user-dashboard']);
    } else if (currentRole === 'admin') {
      return router.createUrlTree(['/admin']);
    }

    return router.createUrlTree(['/login']);
  };
};