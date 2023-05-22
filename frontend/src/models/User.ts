import { Appointment } from "./Appointment";

export interface UserProps {
  id: number;
  api_key: string;
  created_at: Date;
  username: string;
  appointments: Appointment[]
}

export class User {
  id: number;
  api_key: string;
  username: string;
  appointments: Appointment[]

  constructor(id: number, api_key: string, username: string, appointments: Appointment[]) {
    this.id = id;
    this.api_key = api_key;
    this.username = username;
    this.appointments = appointments;
  }
}