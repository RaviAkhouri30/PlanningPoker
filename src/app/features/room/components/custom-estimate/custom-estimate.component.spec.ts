import { TestBed } from '@angular/core/testing';
import { CustomEstimateComponent } from './custom-estimate.component';

describe('CustomEstimateComponent', () => {
  function render(): {
    element: HTMLElement;
    set: ReturnType<typeof vi.fn>;
    type: (text: string) => void;
  } {
    const fixture = TestBed.createComponent(CustomEstimateComponent);
    const set = vi.fn();
    fixture.componentInstance.estimateSet.subscribe(set);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const type = (text: string): void => {
      const field = element.querySelector<HTMLInputElement>('input');
      if (field !== null) {
        field.value = text;
        field.dispatchEvent(new Event('input'));
      }
      element.querySelector<HTMLButtonElement>('button')?.click();
      fixture.detectChanges();
    };
    return { element, set, type };
  }

  it('should send the trimmed estimate and clear the field when one is typed', () => {
    const { element, set, type } = render();

    type('  6 ');

    expect(set).toHaveBeenCalledWith('6');
    expect(element.querySelector('input')?.value).toBe('');
    expect(element.querySelector('.field-error')).toBeNull();
  });

  it('should explain and send nothing when the estimate is blank or too long', () => {
    const { element, set, type } = render();

    type('   ');
    type('123456789');

    expect(set).not.toHaveBeenCalled();
    expect(element.querySelector('.field-error')?.textContent).toContain('up to 8 characters');
    expect(element.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
  });
});
