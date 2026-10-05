import { describe, it, expect } from 'vitest';
import {
    calculateStreak,
    getMonthDates,
    getFirstDayOfMonth,
    isToday,
    isPast,
    isFuture,
    getTodayString,
} from '../utils/streak';

describe('calculateStreak', () => {
    it('returns 0 for empty log', () => {
        expect(calculateStreak([])).toBe(0);
    });

    it('returns 0 when no followed entries', () => {
        const log = [
            { date: '2026-10-02', status: 'partial' },
            { date: '2026-10-01', status: 'missed' },
        ];
        expect(calculateStreak(log)).toBe(0);
    });

    it('calculates streak ending today', () => {
        const log = [
            { date: '2026-10-03', status: 'followed' },
            { date: '2026-10-02', status: 'followed' },
            { date: '2026-10-01', status: 'followed' },
        ];
        expect(calculateStreak(log)).toBe(3);
    });

    it('calculates streak ending yesterday (grace period)', () => {
        const log = [
            { date: '2026-10-02', status: 'followed' },
            { date: '2026-10-01', status: 'followed' },
            { date: '2026-09-30', status: 'followed' },
        ];
        expect(calculateStreak(log)).toBe(3);
    });

    it('returns 0 when streak ended 2+ days ago', () => {
        const log = [
            { date: '2026-10-01', status: 'followed' },
            { date: '2026-09-30', status: 'followed' },
        ];
        expect(calculateStreak(log)).toBe(0);
    });

    it('stops counting at first non-followed day', () => {
        const log = [
            { date: '2026-10-03', status: 'followed' },
            { date: '2026-10-02', status: 'followed' },
            { date: '2026-10-01', status: 'partial' },
            { date: '2026-09-30', status: 'followed' },
        ];
        expect(calculateStreak(log)).toBe(2);
    });

    it('handles unsorted log', () => {
        const log = [
            { date: '2026-10-01', status: 'followed' },
            { date: '2026-10-03', status: 'followed' },
            { date: '2026-10-02', status: 'followed' },
        ];
        expect(calculateStreak(log)).toBe(3);
    });

    it('handles gaps in dates correctly', () => {
        const log = [
            { date: '2026-10-03', status: 'followed' },
            { date: '2026-10-01', status: 'followed' },
        ];
        expect(calculateStreak(log)).toBe(1); // Gap breaks streak
    });
});

describe('getMonthDates', () => {
    it('returns correct dates for October 2026', () => {
        const dates = getMonthDates(2026, 9); // Month is 0-indexed
        expect(dates.length).toBe(31);
        expect(dates[0]).toBe('2026-10-01');
        expect(dates[30]).toBe('2026-10-31');
    });

    it('returns correct dates for February 2024 (leap year)', () => {
        const dates = getMonthDates(2024, 1);
        expect(dates.length).toBe(29);
        expect(dates[28]).toBe('2024-02-29');
    });

    it('returns correct dates for February 2023 (non-leap)', () => {
        const dates = getMonthDates(2023, 1);
        expect(dates.length).toBe(28);
        expect(dates[27]).toBe('2023-02-28');
    });
});

describe('getFirstDayOfMonth', () => {
    it('returns correct day for October 2026 (Wednesday = 3)', () => {
        expect(getFirstDayOfMonth(2026, 9)).toBe(4); // Thursday = 4
    });

    it('returns correct day for January 2026 (Wednesday = 3)', () => {
        expect(getFirstDayOfMonth(2026, 0)).toBe(4); // Thursday = 4
    });
});

describe('isToday', () => {
    it('returns true for today', () => {
        const today = getTodayString();
        expect(isToday(today)).toBe(true);
    });

    it('returns false for yesterday', () => {
        expect(isToday('2026-10-02')).toBe(false);
    });

    it('returns false for tomorrow', () => {
        expect(isToday('2026-10-04')).toBe(false);
    });
});

describe('isPast', () => {
    it('returns true for dates before today', () => {
        expect(isPast('2026-10-02')).toBe(true);
        expect(isPast('2026-09-01')).toBe(true);
    });

    it('returns false for today', () => {
        const today = getTodayString();
        expect(isPast(today)).toBe(false);
    });

    it('returns false for future dates', () => {
        expect(isPast('2026-10-04')).toBe(false);
        expect(isPast('2026-11-01')).toBe(false);
    });
});

describe('isFuture', () => {
    it('returns true for dates after today', () => {
        expect(isFuture('2026-10-04')).toBe(true);
        expect(isFuture('2026-11-01')).toBe(true);
    });

    it('returns false for today', () => {
        const today = getTodayString();
        expect(isFuture(today)).toBe(false);
    });

    it('returns false for past dates', () => {
        expect(isFuture('2026-10-02')).toBe(false);
        expect(isFuture('2026-09-01')).toBe(false);
    });
});

describe('getTodayString', () => {
    it('returns date in YYYY-MM-DD format', () => {
        const today = getTodayString();
        expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(today).toBe('2026-10-03'); // Based on context time
    });
});
