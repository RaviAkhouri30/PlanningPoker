import { type ToastTone } from '@shared/enums/toast-tone.enum';

/** A message for the toast. */
export interface IToastMessage {
  readonly text: string;
  readonly tone: ToastTone;
}

/** A toast on screen. */
export interface IToast extends IToastMessage {
  /** Distinguishes two toasts with the same text. */
  readonly id: number;
}
