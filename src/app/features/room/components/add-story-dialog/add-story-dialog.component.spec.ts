import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { type INewStory } from '../../models/story-draft.util';
import { AddStoryDialogComponent } from './add-story-dialog.component';

describe('AddStoryDialogComponent', () => {
  let fixture: ComponentFixture<AddStoryDialogComponent>;
  let added: INewStory[];
  let closes: number;

  function render(): HTMLDialogElement {
    fixture = TestBed.createComponent(AddStoryDialogComponent);
    fixture.componentRef.setInput('open', true);
    added = [];
    closes = 0;
    fixture.componentInstance.add.subscribe((story) => added.push(story));
    fixture.componentInstance.closed.subscribe(() => (closes += 1));
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
  }

  function type(dialog: HTMLDialogElement, selector: string, value: string): void {
    const field = dialog.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  function press(dialog: HTMLDialogElement, label: string): void {
    const buttons = [...dialog.querySelectorAll<HTMLButtonElement>('button')];
    buttons.find((button) => button.textContent.trim() === label)?.click();
    fixture.detectChanges();
  }

  it('should explain a blank story instead of adding it when Add story is pressed', () => {
    const dialog = render();

    press(dialog, 'Add story');

    expect(added).toEqual([]);
    expect(dialog.querySelector('#new-story-error')?.textContent).toContain('Type what the team');
  });

  it('should explain a story that is too long when it passes the limit', () => {
    const dialog = render();
    type(dialog, '#new-story', 'x'.repeat(201));
    type(dialog, '#new-story-notes', 'y'.repeat(2001));

    press(dialog, 'Add story');

    expect(dialog.querySelector('#new-story-error')?.textContent).toContain('200 characters');
    expect(dialog.querySelector('#new-story-notes-error')?.textContent).toContain('2000');
  });

  it('should send the story with its notes and close when Add story is pressed', () => {
    const dialog = render();
    type(dialog, '#new-story', 'PAY-214 Save cards');
    type(dialog, '#new-story-notes', 'Visa only');

    press(dialog, 'Add story');

    expect(added).toEqual([{ text: 'PAY-214 Save cards', description: 'Visa only' }]);
    expect(closes).toBe(1);
  });

  it('should stay open with an empty field and say what was added when Add another is pressed', () => {
    const dialog = render();
    type(dialog, '#new-story', ' PAY-215 Refunds ');

    press(dialog, 'Add another');

    expect(added).toEqual([{ text: ' PAY-215 Refunds ', description: '' }]);
    expect(closes).toBe(0);
    expect(dialog.querySelector<HTMLInputElement>('#new-story')?.value).toBe('');
    expect(document.activeElement).toBe(dialog.querySelector('#new-story'));
    expect(dialog.querySelector('[role="status"]')?.textContent).toContain('PAY-215 Refunds');
  });

  it('should report closing when the close button is pressed', () => {
    const dialog = render();

    dialog.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click();

    expect(closes).toBe(1);
  });
});
