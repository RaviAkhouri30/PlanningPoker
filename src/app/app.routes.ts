import { type Routes } from '@angular/router';

/**
 * Root route table. Every page is lazy-loaded from a default export (CLAUDE.md §6).
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Ante — Planning poker',
    loadComponent: () => import('@features/landing/landing-page.component'),
  },
  { path: '**', redirectTo: '' },
];
