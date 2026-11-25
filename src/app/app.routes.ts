import { type Routes } from '@angular/router';
import {
  JOIN_ROUTE_SEGMENT,
  MY_ROOMS_ROUTE_SEGMENT,
  ROOM_ID_PARAM,
  ROOM_ROUTE_SEGMENT,
  TERMS_ROUTE_SEGMENT,
} from '@shared/constants/routes.constants';
import { returningGuestGuard } from '@shared/guards/returning-guest.guard';
import { roomMemberGuard } from '@shared/guards/room-member.guard';

/**
 * Root route table. Every page is lazy-loaded from a default export (CLAUDE.md §6). A room's link
 * shows the room to its participants and the join form to everyone else (`roomMemberGuard`); a
 * returning guest arriving at the home page lands on My rooms (`returningGuestGuard`).
 */
export const routes: Routes = [
  {
    path: '',
    title: 'PlanningPoker — Estimate together',
    canActivate: [returningGuestGuard],
    loadComponent: () => import('@features/landing/landing-page.component'),
  },
  {
    path: MY_ROOMS_ROUTE_SEGMENT,
    title: 'PlanningPoker — My rooms',
    loadComponent: () => import('@features/my-rooms/my-rooms-page.component'),
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
  {
    path: TERMS_ROUTE_SEGMENT,
    title: 'PlanningPoker — Terms of use',
    loadComponent: () => import('@features/legal/terms-page.component'),
  },
  { path: '**', redirectTo: '' },
];
