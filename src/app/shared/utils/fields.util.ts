import { type StoreFields } from '@core/interfaces/i-realtime-store';

/** Reads an own field only, never one inherited from the prototype. */
function ownValue(fields: StoreFields, key: string): unknown {
  return Object.getOwnPropertyDescriptor(fields, key)?.value as unknown;
}

/**
 * Typed readers for stored fields. Data from the store is `unknown` until checked, so models are
 * built through these, with a fallback for a missing or malformed field.
 */
export const FieldReader = {
  /** @returns The field as a string, or `fallback`. */
  text(fields: StoreFields, key: string, fallback = ''): string {
    const value = ownValue(fields, key);
    return typeof value === 'string' ? value : fallback;
  },

  /** @returns The field as a string, or `null` when it isn't one. */
  textOrNull(fields: StoreFields, key: string): string | null {
    const value = ownValue(fields, key);
    return typeof value === 'string' ? value : null;
  },

  /** @returns The field as a finite number, or `fallback`. */
  number(fields: StoreFields, key: string, fallback = 0): number {
    const value = ownValue(fields, key);
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  },

  /** @returns The field as a finite number, or `null`. */
  numberOrNull(fields: StoreFields, key: string): number | null {
    const value = ownValue(fields, key);
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  },

  /** @returns The field as a boolean, or `fallback`. */
  flag(fields: StoreFields, key: string, fallback = false): boolean {
    const value = ownValue(fields, key);
    return typeof value === 'boolean' ? value : fallback;
  },

  /** @returns The field when it is one of `allowed`, else `fallback`. */
  oneOf<T extends string>(fields: StoreFields, key: string, allowed: readonly T[], fallback: T): T {
    const value = ownValue(fields, key);
    return allowed.find((option) => option === value) ?? fallback;
  },

  /** @returns The field when it is one of `allowed`, else `null`. */
  oneOfOrNull<T extends string>(fields: StoreFields, key: string, allowed: readonly T[]): T | null {
    const value = ownValue(fields, key);
    return allowed.find((option) => option === value) ?? null;
  },
} as const;
