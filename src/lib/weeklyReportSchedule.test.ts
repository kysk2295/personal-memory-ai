import { describe, expect, test } from 'vitest';
import {
  createDefaultWeeklyReportSchedule,
  evaluateWeeklyReportSchedule,
} from './weeklyReportSchedule';

describe('weekly report schedule', () => {
  test('creates the default owner schedule for Monday morning in-app reports', () => {
    expect(createDefaultWeeklyReportSchedule({ userId: 'user-a' })).toEqual({
      id: 'weekly_report_schedule:user-a',
      userId: 'user-a',
      enabled: true,
      timezone: 'Asia/Seoul',
      runDayOfWeek: 1,
      runTimeLocal: '09:00',
      reportWindowDays: 7,
      notification: {
        channel: 'in-app',
        enabled: true,
      },
    });
  });

  test('marks Monday after the scheduled time due for the previous Monday-Sunday window', () => {
    const schedule = createDefaultWeeklyReportSchedule({ userId: 'user-a' });

    const evaluation = evaluateWeeklyReportSchedule({
      schedule,
      nowLocalDateTime: '2026-06-01T09:05:00',
    });

    expect(evaluation).toEqual({
      due: true,
      reason: 'weekly_report_due',
      reportId: 'weekly_report_2026-05-25_2026-05-31',
      reportWindow: {
        startDate: '2026-05-25',
        endDate: '2026-05-31',
      },
      scheduledForLocal: '2026-06-01T09:00:00',
      notification: {
        channel: 'in-app',
        title: 'Weekly memory report ready',
        body: 'Your private weekly report for 2026-05-25 to 2026-05-31 is ready.',
        reportId: 'weekly_report_2026-05-25_2026-05-31',
      },
    });
  });

  test('does not mark the same weekly report due after it has already been generated', () => {
    const schedule = createDefaultWeeklyReportSchedule({ userId: 'user-a' });

    expect(
      evaluateWeeklyReportSchedule({
        schedule,
        nowLocalDateTime: '2026-06-01T09:05:00',
        lastGeneratedReportId: 'weekly_report_2026-05-25_2026-05-31',
      }),
    ).toEqual({
      due: false,
      reason: 'already_generated',
      reportId: 'weekly_report_2026-05-25_2026-05-31',
      reportWindow: {
        startDate: '2026-05-25',
        endDate: '2026-05-31',
      },
      scheduledForLocal: '2026-06-01T09:00:00',
    });
  });

  test('does not mark disabled schedules due', () => {
    const schedule = {
      ...createDefaultWeeklyReportSchedule({ userId: 'user-a' }),
      enabled: false,
    };

    expect(
      evaluateWeeklyReportSchedule({
        schedule,
        nowLocalDateTime: '2026-06-01T09:05:00',
      }),
    ).toEqual({
      due: false,
      reason: 'schedule_disabled',
    });
  });
});
