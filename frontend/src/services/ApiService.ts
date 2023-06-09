import { Appointment } from "models/Appointment";
import { User } from "models/User";
import {
  getCurrentIsoDate,
  getSelectedDateTimeFormattedString,
  showToast,
} from "utils/util";
import { Globals } from "Globals";
import { toast } from "react-toastify";
import { Invoice } from "models/Invoice";

interface AppointmentCount {
  id: number;
  date: string;
  count: number;
}

export class ApiService {
  private readonly baseUrl: string = Globals.API_URL;
  private readonly user: User;

  constructor(user: User) {
    this.user = user;
  }

  private async fetchJson(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error("Request failed");
      }
    } catch (error) {
      showToast("" + error, "error");
    }
  }

  async generateOdfPage(invoice: Invoice) {
    try {
      const url = this.baseUrl + "generate-pdf";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.user.api_key}`,
        },
        body: JSON.stringify(invoice),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "informe_" + getCurrentIsoDate(new Date()) + ".odt";
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // Manejo de errores en caso de que la generación del archivo falle.
        showToast("No se ha podido generar el informe", "error");
      }
    } catch (error) {
      showToast("No se ha podido generar el informe: " + error, "error");
    }
  }

  async importDb(file: File) {
    try {
      let formData = new FormData();
      formData.append("file", file, "filename.csv");
      const url = this.baseUrl + "import-db";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.user.api_key}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showToast(
            "Archivo importado satisfactoriamente. Se han añadido " +
              data.processed_rows +
              " entradas nuevas.",
            "success"
          );
        } else {
          showToast(data.error, "info");
        }
      } else {
        showToast("No se ha podido importar la base de datos", "error");
      }
    } catch (error) {
      showToast("No se ha podido importar la base de datos: " + error, "error");
    }
  }

  async fetchAppointmentsByMonth(date: Date): Promise<[]> {
    try {
      const year = getCurrentIsoDate(date).substring(0, 4);
      const month = getCurrentIsoDate(date).substring(5, 7);
      const url = `${this.baseUrl}appointments/monthly/${year}/${month}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.user.api_key}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Request failed");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  async fetchEvents(date: Date): Promise<Appointment[]> {
    const today = getCurrentIsoDate(date);
    const formattedDate = today.substring(0, 10);
    const url = `${this.baseUrl}appointments?date=${formattedDate}`;
    try {
      const response = await this.fetchJson(url, {
        headers: {
          Authorization: `Bearer ${this.user.api_key}`,
        },
      });

      if (response) {
        return response.appointments.map(
          (appointment: any) =>
            new Appointment(
              appointment.id,
              appointment.description,
              appointment.appointment_datetime,
              appointment.user_id,
              appointment.created_at
            )
        );
      }
    } catch (error) {
      showToast("No se ha podido obtener la lista de citas: " + error, "error");
    }

    return [];
  }

  async submitFormData(data: FormData, url: string, method: string) {
    const formDataObj = Object.fromEntries(data.entries());
    const jsonData = JSON.stringify(formDataObj);
    try {
      const response = await this.fetchJson(this.baseUrl + url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.user.api_key}`,
        },
        body: jsonData,
      });

      if (response) {
        if (method === "POST") {
          const d = new Date(formDataObj.appointment_datetime.toString());
          showToast(
            "Se ha creado una cita el " + getSelectedDateTimeFormattedString(d),
            "success"
          );
        } else if (method === "PUT") {
          const d = new Date(formDataObj.appointment_datetime.toString());
          showToast(
            "La cita se ha movido a " + getSelectedDateTimeFormattedString(d),
            "success"
          );
        }
        return response;
      }
    } catch (error) {
      showToast("No se ha podido enviar el formulario: " + error, "error");
    }

    return null;
  }

  async fetchStatisticsAppointmentData(): Promise<AppointmentCount[]> {
    const response = await fetch(`${this.baseUrl}stats/appointment_all`);
    const data = await response.json();
    return data as AppointmentCount[];
  }

  async fetchStatisticsAppointmentBetweenDates(
    fromDate: Date,
    toDate: Date
  ): Promise<{}[]> {
    const response = await fetch(
      `${this.baseUrl}stats/appointment_count?date_from=${getFormattedDate(
        fromDate
      )}&date_to=${getFormattedDate(toDate)}`
    );
    const data = await response.json();
    return data;
  }

  async deleteAppointment(appointment_id: string) {
    const url = `${this.baseUrl}appointments/${appointment_id}`;

    try {
      const response = await this.fetchJson(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.user.api_key}`,
        },
      });

      if (response) {
        showToast("Evento eliminado satisfactoriamente", "success");
        return response;
      }
    } catch (error) {
      showToast("No se ha podido eliminar el evento: " + error, "error");
    }

    return null;
  }

  static async login(
    username: string,
    password: string
  ): Promise<User | null | undefined> {
    const baseUrl = Globals.API_URL;
    try {
      const response = await fetch(baseUrl + "login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return new User(
            data.user.id,
            data.token,
            data.user.username,
            data.user.appointments
          );
        } else {
          return null;
        }
      } else {
        throw new Error(
          `Error sending message: ${response.status} ${response.statusText}`
        );
      }
    } catch (error: any) {
      showToast(baseUrl + error.message, "error");
    }
  }

  static async getBackendVersion(): Promise<string | null> {
    const baseUrl = Globals.API_URL;
    const response = await fetch(baseUrl + "version", {
      method: "GET",
    });
    if (response.ok) {
      const data = await response.json();
      return data.version;
    } else {
      throw new Error(
        `Error sending message: ${response.status} ${response.statusText}`
      );
    }
  }
}

function getFormattedDate(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
