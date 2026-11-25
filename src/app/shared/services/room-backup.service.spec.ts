import { TestBed } from '@angular/core/testing';
import { firstValueFrom, throwError } from 'rxjs';
import { IFileSaver } from '@core/interfaces/i-file-saver';
import { type FakeFileSaver } from '@core/backends/fake/fake-file-saver';
import { LoggerService } from '@core/services/logger.service';
import { roomFields, seed, testBackendProviders } from '@shared/testing/test-backend';
import { RoomBackupReader } from './room-backup-reader.service';
import { RoomBackupService } from './room-backup.service';

describe('RoomBackupService', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: testBackendProviders() });
    vi.spyOn(TestBed.inject(LoggerService), 'error').mockImplementation(() => undefined);
    await seed({ 'rooms/r1': roomFields(), 'rooms/r2': roomFields({ name: 'Refunds' }) });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function saver(): FakeFileSaver {
    return TestBed.inject(IFileSaver) as FakeFileSaver;
  }

  it('should save a CSV named after the room when one room is backed up', async () => {
    const result = await firstValueFrom(TestBed.inject(RoomBackupService).download(['r1']));

    expect(result).toEqual({
      fileName: 'planning-poker-r1-2026-11-25.csv',
      saved: 1,
      skipped: 0,
    });
    expect(saver().saved[0]).toMatchObject({
      name: result.fileName,
      type: 'text/csv;charset=utf-8',
    });
  });

  it('should leave out a room it cannot read when several are backed up', async () => {
    const reader = TestBed.inject(RoomBackupReader);
    const read = reader.read.bind(reader);
    vi.spyOn(reader, 'read').mockImplementation((roomId) =>
      roomId === 'r2' ? throwError(() => new Error('denied')) : read(roomId),
    );

    const result = await firstValueFrom(TestBed.inject(RoomBackupService).download(['r1', 'r2']));

    expect(result).toEqual({
      fileName: 'planning-poker-rooms-2026-11-25.csv',
      saved: 1,
      skipped: 1,
    });
  });

  it('should fail without saving when no room can be read', async () => {
    await expect(
      firstValueFrom(TestBed.inject(RoomBackupService).download(['gone'])),
    ).rejects.toThrow('No room could be read');
    expect(saver().saved).toEqual([]);
  });
});
