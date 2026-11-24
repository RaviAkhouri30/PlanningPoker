/** HTTP statuses the functions answer with. */
export enum HttpStatus {
  Ok = 200,
  ServerError = 500,
}

/** Reported by the health check, so a deploy can be matched to its build. */
export const API_NAME = 'ante-api';
