import { FieldReader } from './fields.util';

describe('FieldReader', () => {
  const fields = { name: 'A', count: 2, on: true, bad: Number.NaN };

  it('should read values of the right type', () => {
    expect(FieldReader.text(fields, 'name')).toBe('A');
    expect(FieldReader.textOrNull(fields, 'name')).toBe('A');
    expect(FieldReader.number(fields, 'count')).toBe(2);
    expect(FieldReader.numberOrNull(fields, 'count')).toBe(2);
    expect(FieldReader.flag(fields, 'on')).toBe(true);
    expect(FieldReader.oneOf(fields, 'name', ['A', 'B'], 'B')).toBe('A');
    expect(FieldReader.oneOfOrNull(fields, 'name', ['A', 'B'])).toBe('A');
  });

  it('should fall back when a value is missing or of the wrong type', () => {
    expect(FieldReader.text(fields, 'count', 'x')).toBe('x');
    expect(FieldReader.textOrNull(fields, 'count')).toBeNull();
    expect(FieldReader.number(fields, 'bad', 7)).toBe(7);
    expect(FieldReader.numberOrNull(fields, 'name')).toBeNull();
    expect(FieldReader.flag(fields, 'name', true)).toBe(true);
    expect(FieldReader.oneOf(fields, 'name', ['B', 'C'], 'C')).toBe('C');
    expect(FieldReader.oneOfOrNull(fields, 'name', ['B', 'C'])).toBeNull();
  });
});
