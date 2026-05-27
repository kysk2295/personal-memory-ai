import type { WeeklyReportWindow } from './weeklyReport';

export type WeeklyReportNotificationChannel = 'in-app';
export type WeeklyReportScheduleReason =
  | 'weekly_report_due'
  | 'already_generated'
  | 'before_scheduled_time'
  | 'not_scheduled_day'
  | 'schedule_disabled';

export interface WeeklyReportSchedule {
  id: string;
  userId: string;
  enabled: boolean;
  timezone: string;
  runDayOfWeek: number;
  runTimeLocal: string;
  reportWindowDays: number;
  notification: {
    channel: WeeklyReportNotificationChannel;
    enabled: boolean;
  };
}

export interface WeeklyReportDueNotification {
  channel: WeeklyReportNotificationChannel;
  title: string;
  body: string;
  reportId: string;
}

export type WeeklyReportScheduleEvaluation =
  | {
      due: true;
      reason: 'weekly_report_due';
      reportId: string;
      reportWindow: WeeklyReportWindow;
      scheduledForLocal: string;
      notification?: WeeklyReportDueNotification;
    }
  | {
      due: false;
      reason: Exclude<WeeklyReportScheduleReason, 'weekly_report_due'>;
      reportId?: string;
      reportWindow?: WeeklyReportWindow;
      scheduledForLocal?: string;
    };

export interface CreateDefaultWeeklyReportScheduleInput {
  userId: string;
}

export interface EvaluateWeeklyReportScheduleInput {
  schedule: WeeklyReportSchedule;
  nowLocalDateTime: string;
  lastGeneratedReportId?: string;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function dateFromLocalDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function localDate(value: string): string {
  return value.slice(0, 10);
}

function localTime(value: string): string {
  return value.slice(11, 16);
}

function addDays(date: string, days: number): string {
  const next = new Date(dateFromLocalDate(date).getTime() + days * DAY_IN_MS);
  return next.toISOString().slice(0, 10);
}

function dayOfWeek(date: string): number {
  return dateFromLocalDate(date).getUTCDay();
}

function scheduledForLocal(date: string, runTimeLocal: string): string {
  return `${date}T${runTimeLocal}:00`;
}

function buildReportWindow(runDate: string, reportWindowDays: number): WeeklyReportWindow {
  const endDate = addDays(runDate, -1);
  return {
    startDate: addDays(endDate, -(reportWindowDays - 1)),
    endDate,
  };
}

function reportId(window: WeeklyReportWindow): string {
  return `weekly_report_${window.startDate}_${window.endDate}`;
}

export function createDefaultWeeklyReportSchedule(
  input: CreateDefaultWeeklyReportScheduleInput,
): WeeklyReportSchedule {
  return {
    id: `weekly_report_schedule:${input.userId}`,
    userId: input.userId,
    enabled: true,
    timezone: 'Asia/Seoul',
    runDayOfWeek: 1,
    runTimeLocal: '09:00',
    reportWindowDays: 7,
    notification: {
      channel: 'in-app',
      enabled: true,
    },
  };
}

export function evaluateWeeklyReportSchedule(
  input: EvaluateWeeklyReportScheduleInput,
): WeeklyReportScheduleEvaluation {
  const { schedule } = input;
  if (!schedule.enabled) return { due: false, reason: 'schedule_disabled' };

  const runDate = localDate(input.nowLocalDateTime);
  if (dayOfWeek(runDate) !== schedule.runDayOfWeek) {
    return { due: false, reason: 'not_scheduled_day' };
  }

  const scheduled = scheduledForLocal(runDate, schedule.runTimeLocal);
  const reportWindow = buildReportWindow(runDate, schedule.reportWindowDays);
  const id = reportId(reportWindow);

  if (localTime(input.nowLocalDateTime) < schedule.runTimeLocal) {
    return {
      due: false,
      reason: 'before_scheduled_time',
      reportId: id,
      reportWindow,
      scheduledForLocal: scheduled,
    };
  }

  if (input.lastGeneratedReportId === id) {
    return {
      due: false,
      reason: 'already_generated',
      reportId: id,
      reportWindow,
      scheduledForLocal: scheduled,
    };
  }

  return {
    due: true,
    reason: 'weekly_report_due',
    reportId: id,
    reportWindow,
    scheduledForLocal: scheduled,
    notification: schedule.notification.enabled
      ? {
          channel: schedule.notification.channel,
          title: 'Weekly memory report ready',
          body: `Your private weekly report for ${reportWindow.startDate} to ${reportWindow.endDate} is ready.`,
          reportId: id,
        }
      : undefined,
  };
}
