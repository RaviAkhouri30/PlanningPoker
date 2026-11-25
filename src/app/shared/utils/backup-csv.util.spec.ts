import { type IRoomBackup } from '@shared/interfaces/i-room-backup';
import { Participant } from '@shared/models/participant.model';
import { Room } from '@shared/models/room.model';
import { Story } from '@shared/models/story.model';
import { backupCsv, csvCell } from './backup-csv.util';

describe('backup CSV', () => {
  function backup(): IRoomBackup {
    return {
      room: new Room('r1', { name: 'Sprint 42', code: 'X7K2-92' }),
      people: [
        new Participant('u1', { displayName: 'Alex' }),
        new Participant('u2', { displayName: 'Alex' }),
      ],
      stories: [
        new Story('s1', {
          key: 'PAY-1',
          title: 'Save "cards"',
          description: '=HYPERLINK("x")',
          status: 'done',
          estimate: '5',
          rounds: 2,
        }),
        new Story('s2', { key: '#2', title: 'Refunds', status: 'pending', rounds: 0 }),
      ],
      votes: new Map([
        [
          's1',
          new Map([
            ['u1', '5'],
            ['u2', '8'],
            ['gone', '?'],
          ]),
        ],
      ]),
    };
  }

  it('should quote a cell and double its quotes when it has some', () => {
    expect(csvCell('Save "cards", now')).toBe('"Save ""cards"", now"');
  });

  it('should defuse a cell when it starts like a spreadsheet formula', () => {
    expect(['=1+1', '+1', '-1', '@SUM(A1)'].map(csvCell)).toEqual([
      `"'=1+1"`,
      `"'+1"`,
      `"'-1"`,
      `"'@SUM(A1)"`,
    ]);
  });

  it('should write one row per story with a column per voter when given a room', () => {
    const lines = backupCsv([backup()]).split('\r\n');

    expect(lines[0]).toBe(
      '﻿"Room","Room code","Key","Story","Notes","Status","Estimate","Rounds","Alex","Alex (2)","Former member"',
    );
    expect(lines[1]).toBe(
      `"Sprint 42","X7K2-92","PAY-1","Save ""cards""","'=HYPERLINK(""x"")","Estimated","5","2","5","8","?"`,
    );
    expect(lines[2]).toBe(
      '"Sprint 42","X7K2-92","#2","Refunds","","Not estimated","","0","","",""',
    );
    expect(lines.at(-1)).toBe('');
  });

  it('should share voter columns by name when several rooms are backed up together', () => {
    const second = { ...backup(), room: new Room('r2', { name: 'Refunds', code: '' }) };

    const header = backupCsv([backup(), second]).split('\r\n')[0];

    expect(header?.match(/"Alex"/g)).toHaveLength(1);
  });
});
