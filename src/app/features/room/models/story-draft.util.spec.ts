import { parseStoryDraft } from './story-draft.util';

describe('parseStoryDraft', () => {
  it('should split a tracker key from the title', () => {
    expect(parseStoryDraft('pay-214 Save cards', 3)).toEqual({
      key: 'PAY-214',
      title: 'Save cards',
    });
    expect(parseStoryDraft('#12 Apple Pay', 3)).toEqual({ key: '#12', title: 'Apple Pay' });
  });

  it('should number a story typed without a key', () => {
    expect(parseStoryDraft('Save cards for faster checkout', 3)).toEqual({
      key: '#3',
      title: 'Save cards for faster checkout',
    });
    expect(parseStoryDraft('PAY-214', 1)).toEqual({ key: '#1', title: 'PAY-214' });
  });
});
