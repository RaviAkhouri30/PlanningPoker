import { parseStoryDraft } from './story-draft.util';

describe('parseStoryDraft', () => {
  it('should split a tracker key from the title when the text starts with one', () => {
    expect(parseStoryDraft('pay-214 Save cards', 3)).toEqual({
      key: 'PAY-214',
      title: 'Save cards',
      description: '',
    });
    expect(parseStoryDraft('#12 Apple Pay', 3)).toMatchObject({ key: '#12', title: 'Apple Pay' });
  });

  it('should number a story when it is typed without a key', () => {
    expect(parseStoryDraft('Save cards for faster checkout', 3)).toMatchObject({
      key: '#3',
      title: 'Save cards for faster checkout',
    });
    expect(parseStoryDraft('PAY-214', 1)).toMatchObject({ key: '#1', title: 'PAY-214' });
  });

  it('should keep the notes trimmed when there are some', () => {
    expect(parseStoryDraft('PAY-1 Refunds', 1, '  Cards only \n')).toMatchObject({
      description: 'Cards only',
    });
  });
});
