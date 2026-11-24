import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ParticipantRole } from '@shared/enums/participant-role.enum';
import { TextValidators } from '@shared/validators/text.validators';
import { JoinTab } from '../../models/i-join-state';
import { GuestJoinFormComponent, type JoinForm } from './guest-join-form.component';

describe('GuestJoinFormComponent', () => {
  function render(tab: JoinTab, joining = false): HTMLElement {
    const form: JoinForm = new FormGroup({
      name: new FormControl('Alexander', {
        nonNullable: true,
        validators: [TextValidators.maxTrimmed(3)],
      }),
      colour: new FormControl(0, { nonNullable: true }),
      role: new FormControl<ParticipantRole>(ParticipantRole.Player, { nonNullable: true }),
    });
    form.markAllAsTouched();
    const fixture = TestBed.createComponent(GuestJoinFormComponent);
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('tab', tab);
    fixture.componentRef.setInput('joinLabel', 'Join as Alexander');
    fixture.componentRef.setInput('joining', joining);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should explain a name that is too long and show progress', () => {
    const element = render(JoinTab.Guest, true);

    expect(element.querySelector('#join-name-error')?.textContent).toContain('40 characters');
    expect(element.querySelector('[type="submit"]')?.textContent).toContain('Joining');
    expect(element.querySelector('.swatch--on')?.getAttribute('aria-label')).toBe('Lilac');
  });

  it('should show the account tab', () => {
    expect(render(JoinTab.Account).textContent).toContain('Accounts are coming soon');
  });
});
