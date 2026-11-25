import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RoomRole } from '@shared/enums/room-role.enum';
import { MyRoomsService } from '@shared/services/my-rooms.service';
import { testBackendProviders } from '@shared/testing/test-backend';
import MyRoomsPageComponent from './my-rooms-page.component';

describe('MyRoomsPageComponent', () => {
  function render(withRoom: boolean): HTMLElement {
    TestBed.configureTestingModule({ providers: [...testBackendProviders(), provideRouter([])] });
    if (withRoom) {
      TestBed.inject(MyRoomsService).remember({
        id: 'r1',
        name: 'Sprint 42',
        code: 'X7K2-92',
        role: RoomRole.Player,
        lastVisit: 1,
      });
    }
    const fixture = TestBed.createComponent(MyRoomsPageComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should list the rooms with the browser data warning when there are some', () => {
    const page = render(true);

    expect(page.querySelector('h1')?.textContent).toBe('My rooms');
    expect(page.querySelector('app-browser-data-notice')).not.toBeNull();
    expect(page.querySelector('app-saved-room-list')?.textContent).toContain('Sprint 42');
    expect(page.querySelector('.list-head')?.textContent).toContain('1 room');
    expect(page.querySelector('.list-head')?.textContent).toContain('Back up all as CSV');
  });

  it('should offer to start a room when the list is empty', () => {
    const page = render(false);

    expect(page.querySelector('.empty')?.textContent).toContain('No rooms yet');
    expect(page.querySelector('app-saved-room-list')).toBeNull();
  });
});
