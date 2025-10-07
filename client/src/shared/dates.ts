import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(relativeTime);

export function durationFromDate(date: Date): string {
  return dayjs(date).fromNow();
}

export function getRangeDuration(
  start: Date,
  end: Date,
  unit: dayjs.QUnitType | dayjs.OpUnitType = 'minutes',
): number {
  return dayjs(end).diff(start, unit);
}

export function isToday(date: Date | null): boolean {
  const today = new Date();

  return dayjs(date).isSame(today, 'day');
}

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
