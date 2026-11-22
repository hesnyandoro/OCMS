import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, shouldGeocodeQuery } from './debounce';

describe('shouldGeocodeQuery', () => {
  it('waits until the user has typed at least 3 characters', () => {
    expect(shouldGeocodeQuery('')).toBe(false);
    expect(shouldGeocodeQuery('Ke')).toBe(false);
    expect(shouldGeocodeQuery('Ker')).toBe(true);
    expect(shouldGeocodeQuery('  Ny  ')).toBe(false);
    expect(shouldGeocodeQuery('  Nye  ')).toBe(true);
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call the function until 500ms of quiet time', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 500);
    debounced('K');
    debounced('Ke');
    debounced('Ker');
    vi.advanceTimersByTime(499);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('Ker');
  });
});
