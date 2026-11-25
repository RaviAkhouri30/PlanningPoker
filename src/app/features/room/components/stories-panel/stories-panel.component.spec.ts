import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { StoryTab } from '../../models/i-room-state';
import { aStory } from '../../testing/room-fixtures';
import { StoriesPanelComponent } from './stories-panel.component';

describe('StoriesPanelComponent', () => {
  let fixture: ComponentFixture<StoriesPanelComponent>;

  function render(
    isModerator: boolean,
    stories = [aStory('s1'), aStory('s2', { estimate: '5' }), aStory('s3', { status: 'skipped' })],
  ): HTMLElement {
    fixture = TestBed.createComponent(StoriesPanelComponent);
    fixture.componentRef.setInput('stories', stories);
    fixture.componentRef.setInput('counts', { active: 1, done: 2, all: 3 });
    fixture.componentRef.setInput('tab', StoryTab.All);
    fixture.componentRef.setInput('activeId', 's1');
    fixture.componentRef.setInput('isModerator', isModerator);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should mark the voting story, estimates and skipped ones', () => {
    const element = render(false);

    expect(element.querySelector('[aria-current="true"]')?.textContent).toContain('Voting');
    expect(element.querySelector('.item__estimate')?.textContent).toContain('5');
    expect(element.textContent).toContain('Skipped');
    expect(element.querySelector('form')).toBeNull();
    expect(element.querySelector<HTMLButtonElement>('.item')?.disabled).toBe(true);
  });

  it('should let the moderator pick a tab and a story when they click them', () => {
    const element = render(true);
    const picks: unknown[] = [];
    fixture.componentInstance.tabPick.subscribe((tab) => picks.push(tab));
    fixture.componentInstance.storyPick.subscribe((story) => picks.push(story.id));

    element.querySelectorAll<HTMLButtonElement>('[role="tab"]')[1]?.click();
    element.querySelectorAll<HTMLButtonElement>('.item')[1]?.click();

    expect(picks).toEqual([StoryTab.Done, 's2']);
    expect(element.querySelector('form')).toBeNull();
  });

  it('should say when a tab is empty', () => {
    expect(render(true, []).textContent).toContain('Nothing here yet.');
  });

  it('should ask for a CSV file when the download button is pressed', () => {
    const element = render(false);
    let asked = 0;
    fixture.componentInstance.downloadCsv.subscribe(() => (asked += 1));

    element.querySelector<HTMLButtonElement>('[aria-label="Download the stories as CSV"]')?.click();

    expect(asked).toBe(1);
  });
});
