import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  it('should hand the error to ErrorHandler with its context when an error is reported', () => {
    const handleError = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: ErrorHandler, useValue: { handleError } }],
    });
    const cause = new Error('boom');

    TestBed.inject(LoggerService).error('Casting a vote', cause);

    const reported = handleError.mock.calls[0]?.[0] as Error;
    expect(reported.message).toBe('Casting a vote');
    expect(reported.cause).toBe(cause);
  });
});
