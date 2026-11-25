import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { type Story } from '@shared/models/story.model';
import { StoryTab } from '../../models/i-room-state';
import { ROOM_MESSAGES } from '../../models/room-messages.constants';
import { aStory } from '../../testing/room-fixtures';
import { StoriesTableComponent } from './stories-table.component';

describe('StoriesTableComponent', () => {
  let fixture: ComponentFixture<StoriesTableComponent>;
  const stories = [
    aStory('s1', { description: 'Visa only' }),
    aStory('s2', { key: 'PAY-215', title: 'Refunds' }),
    aStory('s3', { status: 'done', estimate: '5', rounds: 2 }),
  ];

  function render(
    isModerator: boolean,
    listed: readonly Story[] = stories,
    all = listed.length,
  ): HTMLElement {
    fixture = TestBed.createComponent(StoriesTableComponent);
    fixture.componentRef.setInput('stories', listed);
    fixture.componentRef.setInput('counts', { active: 2, done: 1, all });
    fixture.componentRef.setInput('tab', StoryTab.All);
    fixture.componentRef.setInput('activeId', 's1');
    fixture.componentRef.setInput('isModerator', isModerator);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function button(element: HTMLElement, label: string): HTMLButtonElement | undefined {
    return [...element.querySelectorAll<HTMLButtonElement>('button')].find(
      (item) => (item.getAttribute('aria-label') ?? item.textContent.trim()) === label,
    );
  }

  it('should show each story with its notes, status, estimate and rounds', () => {
    const rows = [...render(false).querySelectorAll('tbody tr')];
    const cell = (row: number, selector: string): string | undefined =>
      rows.at(row)?.querySelector(selector)?.textContent;

    expect(rows).toHaveLength(3);
    expect(rows.at(0)?.getAttribute('aria-current')).toBe('true');
    expect(cell(0, '.grid__notes')).toBe('Visa only');
    expect([cell(0, '.pill'), cell(1, '.pill')]).toEqual(['Voting', 'To estimate']);
    expect([cell(2, '.grid__estimate'), cell(2, '.grid__rounds')]).toEqual(['5', '2']);
  });

  it('should hide the moderator actions when the viewer is not the moderator', () => {
    const element = render(false);

    expect(button(element, 'Add story')).toBeUndefined();
    expect(element.querySelector('.grid__pick')).toBeNull();
  });

  it('should let the moderator add a story and pick the next one', () => {
    const element = render(true);
    const events: unknown[] = [];
    fixture.componentInstance.addStory.subscribe(() => events.push('add'));
    fixture.componentInstance.storyPick.subscribe((story) => events.push(story.id));

    button(element, 'Add story')?.click();
    button(element, 'Vote: Refunds')?.click();

    expect(events).toEqual(['add', 's2']);
    expect(element.querySelectorAll('.grid__pick')).toHaveLength(2);
  });

  it('should ask for another tab and a CSV file when their buttons are pressed', () => {
    const element = render(false);
    const events: unknown[] = [];
    fixture.componentInstance.tabPick.subscribe((tab) => events.push(tab));
    fixture.componentInstance.downloadCsv.subscribe(() => events.push('csv'));

    element.querySelectorAll<HTMLButtonElement>('[role="tab"]')[1]?.click();
    button(element, 'Download the stories as CSV')?.click();

    expect(events).toEqual([StoryTab.Done, 'csv']);
  });

  it('should invite the moderator to add the first story when there are none', () => {
    expect(render(true, []).querySelector('.empty')?.textContent).toContain(
      ROOM_MESSAGES.noStoriesModerator,
    );
  });

  it('should say the moderator adds stories when a player sees none', () => {
    expect(render(false, []).textContent).toContain(ROOM_MESSAGES.noStoriesPlayer);
  });

  it('should say the tab is empty when other tabs have stories', () => {
    expect(render(false, [], 3).textContent).toContain(ROOM_MESSAGES.noStoriesInTab);
  });
});
