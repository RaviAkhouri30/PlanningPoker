import { type AbstractControl, type ValidationErrors, type ValidatorFn } from '@angular/forms';

/** Fails with `blank` when the value is empty or only spaces. */
const notBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  String(control.value ?? '').trim() === '' ? { blank: true } : null;

/**
 * @param max Most characters allowed, after trimming.
 * @returns A validator failing with `tooLong` above `max`.
 */
function maxTrimmed(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    String(control.value ?? '').trim().length > max ? { tooLong: { max } } : null;
}

/** Validators for the free-text fields. */
export const TextValidators = { notBlank, maxTrimmed } as const;
