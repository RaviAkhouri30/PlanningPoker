import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Animal } from '@shared/enums/animal.enum';
import { AvatarPickerComponent } from './avatar-picker.component';

describe('AvatarPickerComponent', () => {
  function render(): { fixture: ComponentFixture<AvatarPickerComponent>; element: HTMLElement } {
    const fixture = TestBed.createComponent(AvatarPickerComponent);
    fixture.componentRef.setInput('animal', Animal.Panda);
    fixture.componentRef.setInput('name', 'Maya Chen');
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  function toggle(fixture: ComponentFixture<AvatarPickerComponent>): HTMLButtonElement | null {
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.picker__change',
    );
    button?.click();
    fixture.detectChanges();
    return button;
  }

  it('should show the picked animal with the grid folded away when it first renders', () => {
    const { element } = render();

    expect(element.querySelector('.picker__name')?.textContent).toBe('Panda');
    expect(element.querySelector('[role="radiogroup"]')).toBeNull();
    expect(element.querySelector('.picker__change')?.getAttribute('aria-expanded')).toBe('false');
  });

  it('should open the grid of all animals with the picked one checked when Change is pressed', () => {
    const { fixture, element } = render();

    const button = toggle(fixture);

    expect(button?.getAttribute('aria-expanded')).toBe('true');
    expect(button?.textContent.trim()).toBe('Done');
    expect(element.querySelectorAll('[role="radio"]')).toHaveLength(Object.values(Animal).length);
    expect(element.querySelector('[aria-checked="true"]')?.getAttribute('aria-label')).toBe(
      'Panda',
    );
  });

  it('should report the pick and fold the grid when an animal is chosen', () => {
    const { fixture, element } = render();
    const picks: Animal[] = [];
    fixture.componentInstance.animalPick.subscribe((animal) => picks.push(animal));
    toggle(fixture);

    element.querySelector<HTMLButtonElement>('[aria-label="Owl"]')?.click();
    fixture.detectChanges();

    expect(picks).toEqual([Animal.Owl]);
    expect(element.querySelector('[role="radiogroup"]')).toBeNull();
  });

  it('should fold the grid when Done is pressed', () => {
    const { fixture, element } = render();
    toggle(fixture);

    toggle(fixture);

    expect(element.querySelector('[role="radiogroup"]')).toBeNull();
  });
});
