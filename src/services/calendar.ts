/**
 * Represents an appointment with a title, start time, and end time.
 */
export interface Appointment {
  /**
   * The title of the appointment.
   */
  title: string;
  /**
   * The start time of the appointment.
   */
  start: Date;
  /**
   * The end time of the appointment.
   */
  end: Date;
}

/**
 * Asynchronously retrieves appointments for a given date range.
 *
 * @param start The start date of the range.
 * @param end The end date of the range.
 * @returns A promise that resolves to an array of Appointment objects.
 */
export async function getAppointments(start: Date, end: Date): Promise<Appointment[]> {
  // TODO: Implement this by calling an API.
  const now = new Date();

  return [
    {
      title: 'Meeting with John',
      start: now,
      end: now,
    },
    {
      title: 'Meeting with Jane',
      start: now,
      end: now,
    },
  ];
}
