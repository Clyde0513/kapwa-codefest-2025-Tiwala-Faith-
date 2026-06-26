export const EASTERN_TIME_ZONE = 'America/New_York';

export function formatEasternDate(value: string | number | Date | null | undefined): string {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: EASTERN_TIME_ZONE,
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatEasternTime(value: string | number | Date | null | undefined): string {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: EASTERN_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatEasternDateTime(value: string | number | Date | null | undefined): string {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: EASTERN_TIME_ZONE,
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatEasternMonthDay(value: string | number | Date | null | undefined): string {
  if (!value) return 'Upcoming';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Upcoming';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: EASTERN_TIME_ZONE,
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatEasternWeekdayDate(value: string | number | Date | null | undefined): string {
  if (!value) return 'Date TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date TBD';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: EASTERN_TIME_ZONE,
    weekday: 'long',
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  }).format(date);
}

export function easternDateTimeLocalValue(value: string | number | Date | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: EASTERN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

export function easternDateInputValue(value: string | number | Date | null | undefined): string {
  const localValue = easternDateTimeLocalValue(value);
  return localValue ? localValue.slice(0, 10) : '';
}

export function easternLocalInputToUtcIso(value: string, allDayBoundary?: 'start' | 'end'): string {
  if (!value) return '';

  const localValue = value.includes('T')
    ? value
    : `${value}T${allDayBoundary === 'end' ? '23:59:59' : '00:00:00'}`;

  const [datePart, timePart] = localValue.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour = 0, minute = 0, second = 0] = timePart.split(':').map(Number);

  // Convert a wall-clock America/New_York time into a UTC instant.
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const zoneParts = new Intl.DateTimeFormat('en-US', {
    timeZone: EASTERN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(utcGuess);

  const get = (type: string) => Number(zoneParts.find((part) => part.type === type)?.value || 0);
  const asIfUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  );
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset = asIfUtc - utcGuess.getTime();

  return new Date(desiredAsUtc - offset).toISOString();
}
