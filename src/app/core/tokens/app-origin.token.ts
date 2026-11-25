import { DOCUMENT } from '@angular/common';
import { InjectionToken, inject } from '@angular/core';

/** The site's origin, e.g. `https://planningpoker.example.com`: the base of every room link. */
export const APP_ORIGIN = new InjectionToken<string>('APP_ORIGIN', {
  providedIn: 'root',
  factory: () => inject(DOCUMENT).location.origin,
});
