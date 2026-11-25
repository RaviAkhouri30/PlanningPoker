import { backupNotice } from './backup-notice.util';

describe('backupNotice', () => {
  const fileName = 'planning-poker-rooms-2026-11-25.csv';

  it('should name the file when every room was saved', () => {
    expect(backupNotice({ fileName, saved: 2, skipped: 0 })).toBe(`Backup saved: ${fileName}`);
  });

  it('should say one room was left out when one could not be read', () => {
    expect(backupNotice({ fileName, saved: 1, skipped: 1 })).toBe(
      `Backup saved: ${fileName}. 1 room couldn’t be read and was left out.`,
    );
  });

  it('should count the rooms left out when several could not be read', () => {
    expect(backupNotice({ fileName, saved: 1, skipped: 3 })).toContain(
      '3 rooms couldn’t be read and were left out.',
    );
  });
});
