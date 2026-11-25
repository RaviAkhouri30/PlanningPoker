import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { type IRoomCard } from '../../models/i-room-card';
import { SavedRoomListComponent } from './saved-room-list.component';

describe('SavedRoomListComponent', () => {
  const room: IRoomCard = {
    id: 'r1',
    name: 'Sprint 42',
    code: 'X7K2-92',
    roleLabel: 'Moderator',
    visitLabel: 'Opened yesterday',
    open: ['/', 'r', 'r1'],
  };

  function render(rooms: readonly IRoomCard[]): {
    element: HTMLElement;
    forgotten: string[];
  } {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SavedRoomListComponent);
    const forgotten: string[] = [];
    fixture.componentInstance.forgetRoom.subscribe((id) => forgotten.push(id));
    fixture.componentRef.setInput('rooms', rooms);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, forgotten };
  }

  it('should show the name, role, last visit, code and a link to the room', () => {
    const { element } = render([room]);

    expect(element.querySelector('h2')?.textContent).toBe('Sprint 42');
    expect(element.textContent).toContain('Moderator');
    expect(element.textContent).toContain('Opened yesterday');
    expect(element.textContent).toContain('X7K2-92');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/r/r1');
  });

  it('should leave the code out when the room has none', () => {
    expect(render([{ ...room, code: '' }]).element.textContent).not.toContain('Code');
  });

  it('should ask to forget the room when Forget is pressed', () => {
    const { element, forgotten } = render([room]);

    element.querySelector<HTMLButtonElement>('button')?.click();

    expect(forgotten).toEqual(['r1']);
  });
});
