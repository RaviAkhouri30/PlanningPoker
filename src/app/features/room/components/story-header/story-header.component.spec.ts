import { TestBed } from '@angular/core/testing';
import { aStory } from '../../testing/room-fixtures';
import { StoryHeaderComponent } from './story-header.component';

describe('StoryHeaderComponent', () => {
  function render(
    stories = [aStory('s1', { status: 'done' }), aStory('s2', { description: 'Why it matters' })],
  ): HTMLElement {
    const fixture = TestBed.createComponent(StoryHeaderComponent);
    fixture.componentRef.setInput('story', stories[1] ?? stories[0]);
    fixture.componentRef.setInput('stories', stories);
    fixture.componentRef.setInput('deckLabel', 'Fibonacci');
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show the story, its place and the session progress', () => {
    const header = render();

    expect(header.textContent).toContain('Story 2 of 2');
    expect(header.textContent).toContain('Why it matters');
    expect(header.textContent).toContain('1/2');
    expect(header.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('50');
  });

  it('should show no progress and no description for a lone new story', () => {
    const header = render([aStory('s1')]);

    expect(header.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('0');
    expect(header.querySelector('.story__text')).toBeNull();
  });
});
