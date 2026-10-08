import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    calculateStreak,
    getMonthDates,
    getFirstDayOfMonth,
    isToday,
    isPast,
    isFuture,
    getTodayString,
    formatDate,
} from '../utils/streak';

// Use dynamic current date for tests
const FIXED_DATE = new Date('2026-10-08T00:00:00Z');

function getRelativeDate(daysOffset) {
    const date = new Date(FIXED_DATE);
    date.setDate(date.getDate() + daysOffset);
    return formatDate(date);
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
});

afterEach(() => {
    vi.useRealTimers();
});

describe('calculateStreak', () => {
    it('returns 0 for empty log', () => {
        expect(calculateStreak([])).toBe(0);
    });

    it('returns 0 when no followed entries', () => {
        const log = [
            { date: getRelativeDate(-1), status: 'partial' },
            { date: getRelativeDate(-2), status: 'missed' },
        ];
        expect(calculateStreak(log)).toBe(0);
    });

    it('calculates streak ending today', () => {
        const log = [
            { date: getRelativeDate(0), status: 'followed' },
            { date: getRelativeDate(-1), status: 'followed' },
            { date: getRelativeDate(-2), status: 'followed' },
        ];
        expect(calculateStreak(log)).toBe(3);
    });

    it('calculates streak ending yesterday (grace period)', () => {
        const log = [
            { date: getRelativeDate(-1), status: 'followed' },
            { date: getRelativeDate(-2), status: 'followed' },
            { date: getRelativeDate(-3), status: 'followed' },
        ];
        expect(calculateStreak(log)).toBe(3);
    });

    it('returns 0 when streak ended 2+ days ago', () => {
        const log = [
            { date: getRelativeDate(-2), status: 'followed' },
            { date: getRelativeDate(-3), status: 'followed' },
        ];
        expect(calculateStreak(log)).toBe(0);
    });

    it('stops counting at first non-followed day', () => {
        const log = [
            { date: getRelativeDate(0), status: 'followed' },
            { date: getRelativeDate(-1), status: 'followed' },
            { date: getRelativeDate(-2), status: 'partial' },
            { date: getRelativeDate(-3), status: 'followed' },
        ];
        expect(calculateStreak(log)).toBe(2);
    });

    it('handles unsorted log', () => {
        const log = [
            { date: getRelativeDate(-2), status: 'followed' },
            { date: getRelativeDate(0), status: 'followed' },
            { date: getRelativeDate(-1), status: 'followed' },
        ];
        expect(calculateStreak(log)).toBe(3);
    });

    it('handles gaps in dates correctly', () => {
        const log = [
            { date: getRelativeDate(0), status: 'followed' },
            { date: getRelativeDate(-2), status: 'followed' },
        ];
        expect(calculateStreak(log)).toBe(1); // Gap breaks streak
    });
});

describe('getMonthDates', () => {
    it('returns correct dates for the current month', () => {
        const year = FIXED_DATE.getFullYear();
        const month = FIXED_DATE.getMonth();
        const dates = getMonthDates(year, month);
        const expectedDates = [];
        const lastDay = new Date(year, month + 1, 0).getDate();
        for(let i=1; i<=lastDay; i++){
            expectedDates.push(formatDate(new Date(year, month, i)));
        }
        expect(dates).toEqual(expectedDates);
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
    it('returns correct day for current month', () => {
        const year = FIXED_DATE.getFullYear();
        const month = FIXED_DATE.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        expect(getFirstDayOfMonth(year, month)).toBe(firstDay);
    });

    it('returns correct day for January 2026 (Thursday = 4)', () => {
        expect(getFirstDayOfMonth(2026, 0)).toBe(4);
    });
});

describe('isToday', () => {
    it('returns true for today', () => {
        expect(isToday(getRelativeDate(0))).toBe(true);
    });

    it('returns false for yesterday', () => {
        expect(isToday(getRelativeDate(-1))).toBe(false);
    });

    it('returns false for tomorrow', () => {
        expect(isToday(getRelativeDate(1))).toBe(false);
    });
});

describe('isPast', () => {
    it('returns true for dates before today', () => {
        expect(isPast(getRelativeDate(-1))).toBe(true);
        expect(isPast(getRelativeDate(-30))).toBe(true);
    });

    it('returns false for today', () => {
        expect(isPast(getTodayString())).toBe(false);
    });

    it('returns false for future dates', () => {
        expect(isPast(getRelativeDate(1))).toBe(false);
        expect(isPast(getRelativeDate(30))).toBe(false);
    });
});

describe('isFuture', () => {
    it('returns true for dates after today', () => {
        expect(isFuture(getRelativeDate(1))).toBe(true);
        expect(isFuture(getRelativeDate(30))).toBe(true);
    });

    it('returns false for today', () => {
        expect(isFuture(getTodayString())).toBe(false);
    });

    it('returns false for past dates', () => {
        expect(isFuture(getRelativeDate(-1))).toBe(false);
        expect(isFuture(getRelativeDate(-30))).toBe(false);
    });
});

describe('getTodayString', () => {
    it('returns date in YYYY-MM-DD format', () => {
        const today = getTodayString();
        expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(today).toBe(formatDate(FIXED_DATE));
    });
});
