export class Appointment{
  id: number;
  description: string;
  timestamp: Date;

  constructor(id: number, description: string, timestamp: Date){
    this.id = id;
    this.description = description;
    this.timestamp = timestamp;
  }
}

