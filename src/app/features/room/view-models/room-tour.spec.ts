import { TestBed } from '@angular/core/testing';
import { FakePreferenceStore } from '@core/backends/fake/fake-preference-store';
import { IPreferenceStore } from '@core/interfaces/i-preference-store';
import { type IRoomState, LOADING_ROOM } from '../models/i-room-state';
import { TOUR_SEEN_KEY, TOUR_SEEN_VALUE, TOUR_STEPS } from '../models/tour-steps.constants';
import { aState } from '../testing/room-fixtures';
import { RoomTour } from './room-tour';

describe('RoomTour', () => {
  let state: IRoomState;
  let preferences: FakePreferenceStore;

  function create(moderator: boolean, start: IRoomState = aState()): RoomTour {
    state = start;
    preferences = new FakePreferenceStore();
    TestBed.configureTestingModule({
      providers: [{ provide: IPreferenceStore, useValue: preferences }],
    });
    return TestBed.runInInjectionContext(
      () =>
        new RoomTour({
          view: () => state,
          isModerator: () => moderator,
          patch: (change) => {
            state = { ...state, ...change };
          },
        }),
    );
  }

  it('should open for the moderator on the first visit and remember it', () => {
    const tour = create(true);

    tour.offer();

    expect(state.tourStep).toBe(0);
    expect(preferences.read(TOUR_SEEN_KEY)).toBe(TOUR_SEEN_VALUE);
  });

  it('should stay closed when this browser has already shown it', () => {
    const tour = create(true);
    preferences.write(TOUR_SEEN_KEY, TOUR_SEEN_VALUE);

    tour.offer();

    expect(state.tourStep).toBeNull();
  });

  it('should stay closed for players on their first visit', () => {
    const tour = create(false);

    tour.offer();

    expect(state.tourStep).toBeNull();
  });

  it('should only check once per page when the room keeps updating', () => {
    const tour = create(true);
    tour.offer();
    tour.close();

    tour.offer();

    expect(state.tourStep).toBeNull();
  });

  it('should wait for the room when it has not loaded yet', () => {
    const tour = create(true, LOADING_ROOM);

    tour.offer();
    state = { ...aState(), tourStep: null };
    tour.offer();

    expect(state.tourStep).toBe(0);
  });

  it('should skip the moderator steps when a player replays it', () => {
    const tour = create(false);

    tour.start();

    expect(tour.steps().every((step) => !step.moderatorOnly)).toBe(true);
    expect(tour.progress()).toMatchObject({ number: 1, total: tour.steps().length });
  });

  it('should give the moderator every step when the moderator replays it', () => {
    expect(create(true).steps()).toHaveLength(TOUR_STEPS.length);
  });

  it('should step forward and back, and close after the last step', () => {
    const tour = create(true);
    tour.start();

    tour.back();
    expect(state.tourStep).toBe(0);
    tour.next();
    tour.next();
    tour.back();
    expect(state.tourStep).toBe(1);
    for (let step = 1; step < TOUR_STEPS.length; step += 1) {
      tour.next();
    }

    expect(state.tourStep).toBeNull();
    expect(tour.progress()).toBeNull();
  });

  it('should ignore next and back when the tour is closed', () => {
    const tour = create(true);

    tour.next();
    tour.back();

    expect(state.tourStep).toBeNull();
  });

  it('should show nothing when the step is past the end', () => {
    const tour = create(false, aState({ tourStep: TOUR_STEPS.length }));

    expect(tour.progress()).toBeNull();
  });
});
