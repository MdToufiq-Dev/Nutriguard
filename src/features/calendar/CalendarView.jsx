import { useState, useEffect } from 'react';
import { useLoader } from '../../contexts/LoaderContext';
import { useToast } from '../../contexts/ToastContext';
import { useCurrentUser } from '../../integration/useCurrentUser';
import * as calendarService from '../../services/calendarService';
import {
    calculateStreak,
    getMonthDates,
    getFirstDayOfMonth,
    isToday,
    isPast,
    isFuture,
    getTodayString,
} from '../../utils/streak';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calendar() {
    const { triggerLoader } = useLoader();
    const { showToast } = useToast();
    const user = useCurrentUser();

    const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
    const [complianceLog, setComplianceLog] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [streak, setStreak] = useState(0);

    // Load compliance log
    useEffect(() => {
        const loadData = async () => {
            const log = await calendarService.getComplianceLog(user.id);
            setComplianceLog(log);
            setStreak(calculateStreak(log));
        };
        loadData();
    }, [user.id]);

    const handleDayClick = (date) => {
        if (isFuture(date)) {
            return; // Can't log future days
        }
        setSelectedDate(date);
    };

    const handleCheckIn = async (status) => {
        const date = selectedDate || getTodayString();

        await triggerLoader(async () => {
            await calendarService.setCompliance(user.id, date, status);
            const log = await calendarService.getComplianceLog(user.id);
            setComplianceLog(log);
            setStreak(calculateStreak(log));

            const statusLabels = {
                followed: 'Followed fully',
                partial: 'Partially followed',
                missed: 'Missed'
            };

            showToast(
                `Logged as "${statusLabels[status]}" - ${streak > 0 ? `${streak} day streak!` : 'Keep going!'}`,
                'success'
            );

            setSelectedDate(null);
        }, 300);
    };

    const getComplianceForDate = (date) => {
        return complianceLog.find(log => log.date === date);
    };

    const changeMonth = (offset) => {
        let newMonth = currentMonth + offset;
        let newYear = currentYear;

        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const renderCalendarGrid = () => {
        const dates = getMonthDates(currentYear, currentMonth);
        const firstDayOfWeek = getFirstDayOfMonth(currentYear, currentMonth);
        const days = [];

        // Add blank cells for days before month starts
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(<div key={`blank-${i}`} className="calendar-day blank"></div>);
        }

        // Add all days of the month
        dates.forEach(date => {
            const compliance = getComplianceForDate(date);
            const dayNumber = parseInt(date.split('-')[2]);
            const isTodayDate = isToday(date);
            const isFutureDate = isFuture(date);
            const isSelected = selectedDate === date;

            days.push(
                <div
                    key={date}
                    className={`calendar-day ${compliance ? `compliance-${compliance.status}` : ''} ${isTodayDate ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isFutureDate ? 'future' : ''}`}
                    onClick={() => handleDayClick(date)}
                    style={isTodayDate ? { borderColor: 'var(--accent)', borderWidth: '2px' } : {}}
                >
                    <div className="day-number">{dayNumber}</div>
                    {compliance && (
                        <div className={`compliance-indicator ${compliance.status}`}></div>
                    )}
                </div>
            );
        });

        return days;
    };

    const todayCompliance = getComplianceForDate(getTodayString());

    return (
        <>
            <div className="calendar-header">
                <div>
                    <h2 className="view-title">Adherence Calendar</h2>
                    <p className="view-subtitle">{MONTH_NAMES[currentMonth]} {currentYear}</p>
                </div>
                <div className="streak-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/>
                    </svg>
                    {streak > 0 ? `${streak}-Day Streak` : 'Start Your Streak'}
                </div>
            </div>

            <div className="calendar-controls">
                <button className="btn-month-nav" onClick={() => changeMonth(-1)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <div className="month-label">{MONTH_NAMES[currentMonth]} {currentYear}</div>
                <button className="btn-month-nav" onClick={() => changeMonth(1)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>

            <div className="calendar-weekdays">
                {WEEKDAY_LABELS.map(day => (
                    <div key={day} className="weekday-label">{day}</div>
                ))}
            </div>

            <div className="calendar-grid">
                {renderCalendarGrid()}
            </div>

            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-dot followed"></div>
                    <span>Followed</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot partial"></div>
                    <span>Partial</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot missed"></div>
                    <span>Missed</span>
                </div>
            </div>

            {selectedDate ? (
                <div className="calendar-action-card">
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {isToday(selectedDate) ? 'Today' : selectedDate}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
                            How did you follow your diet plan?
                        </p>
                    </div>
                    <div className="checkin-buttons">
                        <button className="btn-checkin followed" onClick={() => handleCheckIn('followed')}>
                            Followed fully
                        </button>
                        <button className="btn-checkin partial" onClick={() => handleCheckIn('partial')}>
                            Partially
                        </button>
                        <button className="btn-checkin missed" onClick={() => handleCheckIn('missed')}>
                            Missed
                        </button>
                    </div>
                </div>
            ) : !todayCompliance && (
                <div className="calendar-action-card">
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            Did you follow your diet plan today?
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
                            Log daily compliance to maintain your streak.
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleCheckIn('followed')} style={{ width: '100%', maxWidth: '240px' }}>
                        Yes, I Followed My Plan!
                    </button>
                </div>
            )}
        </>
    );
}
