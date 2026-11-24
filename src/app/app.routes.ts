import { type Routes } from '@angular/router';
import {
  JOIN_ROUTE_SEGMENT,
  ROOM_ID_PARAM,
  ROOM_ROUTE_SEGMENT,
} from '@shared/constants/routes.constants';

/**
 * Root route table. Every page is lazy-loaded from a default export (CLAUDE.md §6).
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Ante — Planning poker',
    loadComponent: () => import('@features/landing/landing-page.component'),
  },
  {
    path: `${ROOM_ROUTE_SEGMENT}/:${ROOM_ID_PARAM}/${JOIN_ROUTE_SEGMENT}`,
    title: 'Ante — Join the room',
    loadComponent: () => import('@features/join/join-page.component'),
  },
  { path: '**', redirectTo: '' },
];
