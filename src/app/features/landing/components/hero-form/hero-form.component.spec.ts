import { Animal } from '@shared/enums/animal.enum';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TextValidators } from '@shared/validators/text.validators';
import { IDLE_LANDING } from '../../models/i-landing-state';
import { HeroFormComponent, type IHeroForms } from './hero-form.component';

describe('HeroFormComponent', () => {
  function render(state = IDLE_LANDING): {
    element: HTMLElement;
    forms: IHeroForms;
    fixture: ComponentFixture<HeroFormComponent>;
  } {
    const forms: IHeroForms = {
      create: new FormGroup({
        name: new FormControl('', {
          nonNullable: true,
          validators: [TextValidators.notBlank, TextValidators.maxTrimmed(3)],
        }),
        roomName: new FormControl('', { nonNullable: true }),
        avatar: new FormControl<Animal>(Animal.Fox, { nonNullable: true }),
        facilitate: new FormControl(false, { nonNullable: true }),
      }),
      code: new FormGroup({ code: new FormControl('', { nonNullable: true }) }),
    };
    const fixture = TestBed.createComponent(HeroFormComponent);
    fixture.componentRef.setInput('forms', forms);
    fixture.componentRef.setInput('state', state);
    fixture.componentRef.setInput('linkPrefix', 'planningpoker.test/r/');
    fixture.componentRef.setInput('slug', 'sprint-42');
    fixture.componentRef.setInput('createLabel', 'Create my room');
    fixture.componentRef.setInput('avatar', Animal.Fox);
    fixture.detectChanges();
    forms.create.markAllAsTouched();
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, forms, fixture };
  }

  it('should preview the link and explain a missing name', () => {
    const { element } = render();

    expect(element.querySelector('.panel__link')?.textContent).toContain(
      'planningpoker.test/r/sprint-42-…',
    );
    expect(element.querySelector('#hero-name-error')?.textContent).toContain('Enter your name');
  });

  it('should explain a name that is too long', () => {
    const { element, fixture } = render();
    const field = element.querySelector<HTMLInputElement>('#hero-name')!;
    field.value = 'Alexander';
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(element.querySelector('#hero-name-error')?.textContent).toContain('40 characters');
  });

  it('should show progress and the code error', () => {
    const { element } = render({
      creating: true,
      joining: true,
      codeError: 'No room has that code.',
    });

    expect(element.querySelector('.panel__cta')?.textContent).toContain('Creating your room');
    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'No room has that code.',
    );
  });

  it('should record that the organiser only facilitates when the box is ticked', () => {
    const { element, forms } = render();

    element.querySelector<HTMLInputElement>('input[type="checkbox"]')?.click();

    expect(forms.create.controls.facilitate.value).toBe(true);
  });
});
