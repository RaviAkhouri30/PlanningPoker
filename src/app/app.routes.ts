import { type Routes } from '@angular/router';
import {
  JOIN_ROUTE_SEGMENT,
  ROOM_ID_PARAM,
  ROOM_ROUTE_SEGMENT,
} from '@shared/constants/routes.constants';
import { roomMemberGuard } from '@shared/guards/room-member.guard';

/**
 * Root route table. Every page is lazy-loaded from a default export (CLAUDE.md §6). A room's link
 * shows the room to its participants and the join form to everyone else (`roomMemberGuard`).
 */
export const routes: Routes = [
  {
    path: '',
    title: 'PlanningPoker — Estimate together',
    loadComponent: () => import('@features/landing/landing-page.component'),
  },
  {
    path: `${ROOM_ROUTE_SEGMENT}/:${ROOM_ID_PARAM}/${JOIN_ROUTE_SEGMENT}`,
    title: 'PlanningPoker — Join the room',
    loadComponent: () => import('@features/join/join-page.component'),
  },
  {
    path: `${ROOM_ROUTE_SEGMENT}/:${ROOM_ID_PARAM}`,
    title: 'PlanningPoker — Planning room',
    canActivate: [roomMemberGuard],
    loadComponent: () => import('@features/room/room-page.component'),
  },
  { path: '**', redirectTo: '' },
];
