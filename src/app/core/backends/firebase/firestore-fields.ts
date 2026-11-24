import { SERVER_TIME, type StoreFields } from '@core/interfaces/i-realtime-store';

/** The shape of an SDK `Timestamp`, without importing the SDK. */
interface ITimestampLike {
  toMillis(): number;
}

function isTimestamp(value: unknown): value is ITimestampLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Partial<ITimestampLike>).toMillis === 'function'
  );
}

/**
 * @param fields Fields as the app writes them.
 * @param serverTime The SDK's server-timestamp sentinel.
 * @returns The fields with every `SERVER_TIME` swapped for `serverTime`.
 */
export function toFirestoreFields(fields: StoreFields, serverTime: unknown): StoreFields {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, value === SERVER_TIME ? serverTime : value]),
  );
}

/**
 * @param data A document's data as the SDK reads it.
 * @returns The fields with every timestamp as milliseconds, so no SDK type leaves the adapter.
 */
export function fromFirestoreFields(data: Readonly<Record<string, unknown>>): StoreFields {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      isTimestamp(value) ? value.toMillis() : value,
    ]),
  );
}
