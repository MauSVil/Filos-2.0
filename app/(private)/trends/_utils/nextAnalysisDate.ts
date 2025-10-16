import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

/**
 * Calcula la próxima fecha de análisis automático
 * Los análisis se ejecutan el día 1 y 15 de cada mes a las 2:00 AM
 */
export const getNextAnalysisDate = (): Date => {
  const now = moment();
  const currentDay = now.date();
  const currentMonth = now.month();
  const currentYear = now.year();

  // Si estamos antes del día 1 a las 2 AM, el próximo es día 1
  if (currentDay === 1 && now.hour() < 2) {
    return moment().date(1).hour(2).minute(0).second(0).millisecond(0).toDate();
  }

  // Si estamos entre el día 1 (después de las 2 AM) y el día 15 (antes de las 2 AM)
  if (currentDay < 15 || (currentDay === 15 && now.hour() < 2)) {
    return moment().date(15).hour(2).minute(0).second(0).millisecond(0).toDate();
  }

  // Si estamos después del día 15 a las 2 AM, el próximo es día 1 del siguiente mes
  return moment()
    .add(1, 'month')
    .date(1)
    .hour(2)
    .minute(0)
    .second(0)
    .millisecond(0)
    .toDate();
};

/**
 * Obtiene el tiempo restante hasta el próximo análisis
 */
export const getTimeUntilNextAnalysis = (): {
  days: number;
  hours: number;
  minutes: number;
  totalHours: number;
  formatted: string;
} => {
  const nextDate = moment(getNextAnalysisDate());
  const now = moment();
  const duration = moment.duration(nextDate.diff(now));

  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const totalHours = Math.floor(duration.asHours());

  let formatted = '';
  if (days > 0) {
    formatted = `${days} día${days !== 1 ? 's' : ''}`;
    if (hours > 0) {
      formatted += ` y ${hours} hora${hours !== 1 ? 's' : ''}`;
    }
  } else if (hours > 0) {
    formatted = `${hours} hora${hours !== 1 ? 's' : ''}`;
    if (minutes > 0) {
      formatted += ` y ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    }
  } else {
    formatted = `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }

  return {
    days,
    hours,
    minutes,
    totalHours,
    formatted,
  };
};
