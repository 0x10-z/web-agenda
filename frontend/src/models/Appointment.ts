import { interactive } from "@material-tailwind/react/types/components/popover";

export interface AppointmentProps {
  id: string;
  description: string;
  appointment_datetime: Date;
  created_at: Date;
}

export class Appointment {
  id: string;
  description: string;
  appointment_datetime: Date;
  user_id: number;
  created_at: Date;

  constructor(id: string, description: string, appointment_datetime: string, user_id: number, created_at: string) {
    this.id = id;
    this.description = description;
    this.appointment_datetime = new Date(appointment_datetime);
    this.user_id = user_id;
    this.created_at = new Date(created_at);
  }

  localeTime(){
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    return this.appointment_datetime.toLocaleString([], options);
  }

  createdAtTime(){
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return this.created_at.toLocaleString([], options);
  }
}
