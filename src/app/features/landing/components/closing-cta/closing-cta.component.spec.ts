import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TextValidators } from '@shared/validators/text.validators';
import { ClosingCtaComponent } from './closing-cta.component';

describe('ClosingCtaComponent', () => {
  it('should create on submit and explain a missing name', () => {
    const name = new FormControl('', { nonNullable: true, validators: [TextValidators.notBlank] });
    const fixture = TestBed.createComponent(ClosingCtaComponent);
    fixture.componentRef.setInput('name', name);
    const create = vi.fn();
    fixture.componentInstance.create.subscribe(create);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    name.markAsTouched();
    fixture.detectChanges();

    expect(create).toHaveBeenCalled();
    expect(element.querySelector('[role="alert"]')).not.toBeNull();
  });
});
