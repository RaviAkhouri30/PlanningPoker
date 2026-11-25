import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { type IRoomCard } from '../../models/i-room-card';
import { ForgetRoomDialogComponent } from './forget-room-dialog.component';

describe('ForgetRoomDialogComponent', () => {
  const room: IRoomCard = {
    id: 'r1',
    name: 'Sprint 42',
    code: 'X7K2-92',
    roleLabel: 'Moderator',
    visitLabel: 'Opened yesterday',
    open: ['/', 'r', 'r1'],
  };
  let fixture: ComponentFixture<ForgetRoomDialogComponent>;

  function render(current: IRoomCard | null): HTMLDialogElement {
    fixture = TestBed.createComponent(ForgetRoomDialogComponent);
    fixture.componentRef.setInput('room', current);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
  }

  function button(dialog: HTMLDialogElement, label: string): HTMLButtonElement {
    return [...dialog.querySelectorAll('button')].find((b) => b.textContent.trim() === label)!;
  }

  it('should stay closed when no room is being forgotten', () => {
    expect(render(null).hasAttribute('open')).toBe(false);
  });

  it('should warn that it cannot be undone and show the code when a room is picked', () => {
    const dialog = render(room);

    expect(dialog.hasAttribute('open')).toBe(true);
    expect(dialog.querySelector('h2')?.textContent).toBe('Forget Sprint 42?');
    expect(dialog.textContent).toContain("can't be undone");
    expect(dialog.textContent).toContain('guest');
    expect(dialog.querySelector('.keep__code')?.textContent).toBe('X7K2-92');
  });

  it('should ask for the link only when the room has no code', () => {
    const dialog = render({ ...room, code: '' });

    expect(dialog.querySelector('.keep__code')).toBeNull();
    expect(dialog.querySelector('.keep')?.textContent).toContain('its link');
  });

  it('should confirm when Forget room is pressed', () => {
    const dialog = render(room);
    const confirmed = vi.fn();
    fixture.componentInstance.confirmForget.subscribe(confirmed);

    button(dialog, 'Forget room').click();

    expect(confirmed).toHaveBeenCalledTimes(1);
  });

  it('should close without forgetting when Keep it is pressed', () => {
    const dialog = render(room);
    const closed = vi.fn();
    const confirmed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    fixture.componentInstance.confirmForget.subscribe(confirmed);

    button(dialog, 'Keep it').click();

    expect(closed).toHaveBeenCalledTimes(1);
    expect(confirmed).not.toHaveBeenCalled();
  });

  it('should close when Escape cancels the dialog', () => {
    const dialog = render(room);
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);

    dialog.dispatchEvent(new Event('cancel'));

    expect(closed).toHaveBeenCalledTimes(1);
  });
});
