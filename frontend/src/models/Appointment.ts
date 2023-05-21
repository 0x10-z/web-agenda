export interface AppointmentProps {
  id: string;
  description: string;
  datetime: Date;
  created_at: Date;
}

export class Appointment {
  id: string;
  description: string;
  datetime: Date;

  constructor(id: string, description: string, datetime: Date) {
    this.id = id;
    this.description = description;
    this.datetime = datetime;
  }

  static create(description: string, datetime: Date): Appointment {
    const id = generateGUID();
    return new Appointment(id, description, datetime);
  }
}

/* eslint-disable no-mixed-operators */

function generateGUID() {
  var d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
    d += performance.now();
  }
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c==='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}