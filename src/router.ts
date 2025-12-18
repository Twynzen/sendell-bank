/* ═══════════════════════════════════════════════════════════════════════════
   SENDELLBANK ROUTER
   Application routing configuration using Vaadin Router
   ═══════════════════════════════════════════════════════════════════════════ */

import { Router } from '@vaadin/router';
import { authService } from './services/auth.service';
import { eventBus, AppEvents } from './state/event-bus';

// Lazy load pages
const loadLogin = () => import('./pages/page-login');
const loadDashboard = () => import('./pages/page-dashboard');
const loadAccounts = () => import('./pages/page-accounts');
const loadTransfers = () => import('./pages/page-transfers');
const loadCards = () => import('./pages/page-cards');
const loadHistory = () => import('./pages/page-history');
const loadSettings = () => import('./pages/page-settings');
const loadNotFound = () => import('./pages/page-not-found');

// Route configuration
const routes = [
  {
    path: '/login',
    component: 'page-login',
    action: async () => {
      await loadLogin();
    },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    component: 'page-dashboard',
    action: async () => {
      await loadDashboard();
    },
  },
  {
    path: '/accounts',
    component: 'page-accounts',
    action: async () => {
      await loadAccounts();
    },
  },
  {
    path: '/accounts/:id',
    component: 'page-accounts',
    action: async () => {
      await loadAccounts();
    },
  },
  {
    path: '/transfers',
    component: 'page-transfers',
    action: async () => {
      await loadTransfers();
    },
  },
  {
    path: '/transfers/new',
    component: 'page-transfers',
    action: async () => {
      await loadTransfers();
    },
  },
  {
    path: '/cards',
    component: 'page-cards',
    action: async () => {
      await loadCards();
    },
  },
  {
    path: '/cards/:id',
    component: 'page-cards',
    action: async () => {
      await loadCards();
    },
  },
  {
    path: '/history',
    component: 'page-history',
    action: async () => {
      await loadHistory();
    },
  },
  {
    path: '/settings',
    component: 'page-settings',
    action: async () => {
      await loadSettings();
    },
  },
  {
    path: '/settings/:section',
    component: 'page-settings',
    action: async () => {
      await loadSettings();
    },
  },
  {
    path: '(.*)',
    component: 'page-not-found',
    action: async () => {
      await loadNotFound();
    },
  },
];

// Public routes that don't require authentication
const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

/**
 * Initialize the router
 */
export function initRouter(outlet: HTMLElement): Router {
  const router = new Router(outlet);

  // Add auth guard
  router.setRoutes([
    {
      path: '(.*)',
      action: (context, commands) => {
        const isPublicRoute = publicRoutes.some(
          (route) =>
            context.pathname === route || context.pathname.startsWith(route)
        );

        // Check authentication
        if (!isPublicRoute && !authService.isAuthenticated()) {
          // Store intended destination
          sessionStorage.setItem('redirectAfterLogin', context.pathname);
          return commands.redirect('/login');
        }

        // If authenticated and trying to access login, redirect to dashboard
        if (context.pathname === '/login' && authService.isAuthenticated()) {
          return commands.redirect('/dashboard');
        }

        // Emit route change event
        eventBus.emit(AppEvents.ROUTE_CHANGED, {
          path: context.pathname,
          params: context.params,
        });

        return undefined;
      },
      children: routes,
    },
  ]);

  return router;
}

/**
 * Navigate to a path programmatically
 */
export function navigateTo(path: string): void {
  Router.go(path);
}

/**
 * Navigate to login with redirect
 */
export function navigateToLogin(redirectTo?: string): void {
  if (redirectTo) {
    sessionStorage.setItem('redirectAfterLogin', redirectTo);
  }
  Router.go('/login');
}

/**
 * Navigate after successful login
 */
export function navigateAfterLogin(): void {
  const redirectTo = sessionStorage.getItem('redirectAfterLogin');
  sessionStorage.removeItem('redirectAfterLogin');
  Router.go(redirectTo || '/dashboard');
}

/**
 * Get current route location
 */
export function getCurrentLocation(): { pathname: string; search: string; hash: string } {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  };
}

export default { initRouter, navigateTo, navigateToLogin, navigateAfterLogin, getCurrentLocation };
