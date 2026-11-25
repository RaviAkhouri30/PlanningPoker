import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { TOUR_STEPS } from '../../models/tour-steps.constants';
import { TourTarget } from '../../models/tour-target.enum';
import { RoomTourComponent } from './room-tour.component';

describe('RoomTourComponent', () => {
  let fixture: ComponentFixture<RoomTourComponent>;
  let target: HTMLElement | null = null;

  async function render(number: number, total = TOUR_STEPS.length): Promise<HTMLElement> {
    fixture = TestBed.createComponent(RoomTourComponent);
    fixture.componentRef.setInput('step', TOUR_STEPS[0]);
    fixture.componentRef.setInput('number', number);
    fixture.componentRef.setInput('total', total);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function addTarget(): HTMLElement {
    target = document.createElement('button');
    target.dataset['tour'] = TourTarget.Invite;
    target.getBoundingClientRect = (): DOMRect =>
      ({ top: 600, left: 100, width: 80, height: 40 }) as DOMRect;
    document.body.append(target);
    return target;
  }

  afterEach(() => {
    target?.remove();
    target = null;
  });

  it('should show the step, its place and focus "Next" when a step opens', async () => {
    const element = await render(1);

    expect(element.querySelector('[role="dialog"]')?.textContent).toContain(TOUR_STEPS[0]?.title);
    expect(element.textContent).toContain(`Step 1 of ${String(TOUR_STEPS.length)}`);
    expect(element.querySelector<HTMLButtonElement>('.btn:not(.btn--primary)')?.disabled).toBe(
      true,
    );
    expect(document.activeElement?.textContent.trim()).toBe('Next');
  });

  it('should dim the page when the step has nothing to point at', async () => {
    const element = await render(1);

    expect(element.querySelector('.dim')).not.toBeNull();
    expect(element.querySelector('.spot')).toBeNull();
  });

  it('should light the part and scroll it into view when it is on the page', async () => {
    const part = addTarget();
    const scrollIntoView = vi.fn();
    part.scrollIntoView = scrollIntoView;

    const element = await render(1);
    const spot = element.querySelector<HTMLElement>('.spot');

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center', inline: 'nearest' });
    expect([spot?.style.top, spot?.style.left, spot?.style.width]).toEqual([
      '592px',
      '92px',
      '96px',
    ]);
    expect(element.querySelector('.coach--top')).not.toBeNull();
  });

  it('should say "Done" on the last step', async () => {
    const element = await render(3, 3);

    expect(element.querySelector('.btn--primary')?.textContent.trim()).toBe('Done');
  });

  it('should ask to go back, forward or close', async () => {
    const element = await render(2);
    const calls: string[] = [];
    fixture.componentInstance.back.subscribe(() => calls.push('back'));
    fixture.componentInstance.next.subscribe(() => calls.push('next'));
    fixture.componentInstance.skip.subscribe(() => calls.push('skip'));

    element.querySelector<HTMLButtonElement>('.btn:not(.btn--primary)')?.click();
    element.querySelector<HTMLButtonElement>('.btn--primary')?.click();
    element.querySelector<HTMLButtonElement>('.coach__skip')?.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(calls).toEqual(['back', 'next', 'skip', 'skip']);
  });

  it('should follow the part when the page scrolls', async () => {
    const part = addTarget();
    const element = await render(1);
    part.getBoundingClientRect = (): DOMRect =>
      ({ top: 50, left: 100, width: 80, height: 40 }) as DOMRect;

    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(element.querySelector<HTMLElement>('.spot')?.style.top).toBe('42px');
    expect(element.querySelector('.coach--top')).toBeNull();
  });
});
