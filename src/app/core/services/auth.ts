import { Injectable, signal, computed } from '@angular/core';

export type UserRole = 'admin' | 'user';

export interface UserSession {
  username: string;
  role: UserRole;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'DAM2_AUTH_SESSION';

  // Signal reactivo privado que almacena la sesión
  private _currentUser = signal<UserSession | null>(this.readSessionFromStorage());

  // Selectores computados de solo lectura
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = computed(() => this._currentUser()?.isAuthenticated ?? false);
  public userRole = computed(() => this._currentUser()?.role ?? null);

  /**
   * Valida credenciales:
   * - admin / 123 -> Rol: 'admin'
   * - operador / 123 -> Rol: 'user'
   */
  public login(user: string, pass: string): boolean {
    let role: UserRole | null = null;

    if (user === 'admin' && pass === '123') {
      role = 'admin';
    } else if (user === 'operador' && pass === '123') {
      role = 'user';
    }

    if (role) {
      const sessionData: UserSession = {
        username: user,
        role: role,
        isAuthenticated: true
      };

      // 1. Actualizar estado reactivo en memoria
      this._currentUser.set(sessionData);

      // 2. Persistir en sessionStorage (Web Storage API)
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
      return true;
    }

    return false;
  }

  /**
   * Destruye la sesión activa
   */
  public logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this._currentUser.set(null);
  }

  /**
   * Recupera la sesión persistida al refrescar la pantalla
   */
  private readSessionFromStorage(): UserSession | null {
    const rawData = sessionStorage.getItem(this.STORAGE_KEY);
    if (!rawData) return null;

    try {
      return JSON.parse(rawData) as UserSession;
    } catch {
      sessionStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }
}