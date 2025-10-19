/**
 * Utilidad centralizada para manejo de fechas en timezone Mexico_City
 *
 * Usa moment-timezone para garantizar que todas las operaciones de fecha
 * se hagan en la zona horaria correcta de México.
 */

import moment from "moment-timezone";

const TIMEZONE = "America/Mexico_City";

/**
 * Obtiene la fecha actual en timezone de Mexico_City
 */
export function getNowInMexicoCity(): Date {
  return moment.tz(TIMEZONE).toDate();
}

/**
 * Obtiene el inicio del día actual (00:00:00.000) en Mexico_City
 */
export function getTodayStartInMexicoCity(): Date {
  return moment.tz(TIMEZONE).startOf("day").toDate();
}

/**
 * Obtiene el fin del día actual (23:59:59.999) en Mexico_City
 */
export function getTodayEndInMexicoCity(): Date {
  return moment.tz(TIMEZONE).endOf("day").toDate();
}

/**
 * Obtiene el inicio de la semana (lunes 00:00:00.000) en Mexico_City
 */
export function getStartOfWeekInMexicoCity(): Date {
  return moment.tz(TIMEZONE).startOf("isoWeek").toDate();
}

/**
 * Obtiene el fin de la semana (domingo 23:59:59.999) en Mexico_City
 */
export function getEndOfWeekInMexicoCity(): Date {
  return moment.tz(TIMEZONE).endOf("isoWeek").toDate();
}

/**
 * Convierte una fecha a timezone de Mexico_City
 */
export function toMexicoCityTime(date: Date | string): Date {
  return moment.tz(date, TIMEZONE).toDate();
}

/**
 * Obtiene el inicio del día para una fecha específica en Mexico_City
 */
export function getStartOfDayInMexicoCity(date: Date | string): Date {
  return moment.tz(date, TIMEZONE).startOf("day").toDate();
}

/**
 * Obtiene el fin del día para una fecha específica en Mexico_City
 */
export function getEndOfDayInMexicoCity(date: Date | string): Date {
  return moment.tz(date, TIMEZONE).endOf("day").toDate();
}

/**
 * Formatea una fecha en formato legible para Mexico
 */
export function formatDateMX(date: Date | string, format: string = "DD/MM/YYYY"): string {
  return moment.tz(date, TIMEZONE).format(format);
}

/**
 * Calcula diferencia de días entre dos fechas en Mexico_City timezone
 */
export function getDaysDifference(date1: Date | string, date2: Date | string): number {
  const m1 = moment.tz(date1, TIMEZONE).startOf("day");
  const m2 = moment.tz(date2, TIMEZONE).startOf("day");
  return m1.diff(m2, "days");
}

/**
 * Verifica si una fecha es hoy en Mexico_City
 */
export function isToday(date: Date | string): boolean {
  const today = moment.tz(TIMEZONE).startOf("day");
  const compareDate = moment.tz(date, TIMEZONE).startOf("day");
  return today.isSame(compareDate);
}

/**
 * Verifica si una fecha es mañana en Mexico_City
 */
export function isTomorrow(date: Date | string): boolean {
  const tomorrow = moment.tz(TIMEZONE).add(1, "day").startOf("day");
  const compareDate = moment.tz(date, TIMEZONE).startOf("day");
  return tomorrow.isSame(compareDate);
}

/**
 * Verifica si una fecha está en la semana actual en Mexico_City
 */
export function isThisWeek(date: Date | string): boolean {
  const startOfWeek = moment.tz(TIMEZONE).startOf("isoWeek");
  const endOfWeek = moment.tz(TIMEZONE).endOf("isoWeek");
  const compareDate = moment.tz(date, TIMEZONE);
  return compareDate.isBetween(startOfWeek, endOfWeek, null, "[]");
}
