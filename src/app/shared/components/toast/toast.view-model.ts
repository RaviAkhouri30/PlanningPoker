import { Injectable, computed, inject } from '@angular/core';
import { type Observable, concat, map, of, switchMap, tap, timer } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { TOAST_DURATION_MS } from '@shared/constants/toast.constants';
import { type IToast } from '@shared/interfaces/i-toast';
import { ToastService } from '@shared/services/toast.service';

/** Shows one toast at a time, as the design does, and hides it after `TOAST_DURATION_MS`. */
@Injectable()
export class ToastViewModel extends ViewModel<IToast | null> {
  /** The toast on screen, or `null`. */
  public readonly toast = computed(() => this.data() ?? null);

  private readonly toastService = inject(ToastService);
  private nextId = 0;

  protected override attachCommandHandler(): Observable<unknown> {
    return this.toastService.messages$.pipe(
      // switchMap: a new message replaces the one on screen and restarts the timer.
      switchMap((message) => {
        this.nextId += 1;
        const toast: IToast = { ...message, id: this.nextId };
        return concat(of(toast), timer(TOAST_DURATION_MS).pipe(map(() => null)));
      }),
      tap((toast) => {
        this.setData(toast);
      }),
    );
  }
}
