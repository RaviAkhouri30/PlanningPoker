import { FormControl } from '@angular/forms';
import { TextValidators } from './text.validators';

describe('TextValidators', () => {
  it.each([
    ['', { blank: true }],
    ['   ', { blank: true }],
    [null, { blank: true }],
    ['Alex', null],
  ])('should judge %o as %o for notBlank', (value, result) => {
    expect(TextValidators.notBlank(new FormControl(value))).toEqual(result);
  });

  it('should fail above the limit, ignoring surrounding spaces', () => {
    const max3 = TextValidators.maxTrimmed(3);

    expect(max3(new FormControl('  abc  '))).toBeNull();
    expect(max3(new FormControl('abcd'))).toEqual({ tooLong: { max: 3 } });
    expect(max3(new FormControl(null))).toBeNull();
  });
});
