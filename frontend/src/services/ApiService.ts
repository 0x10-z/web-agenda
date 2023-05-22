import { Appointment } from "models/Appointment";
import { User } from "models/User";
import { showErrorToast } from "utils/util";
import { Globals } from "Globals";
import { Auth } from "utils/auth";

export class ApiService{

  API_URL = Globals.API_URL;
  
  async resetSession(user: User): Promise<boolean> {
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.api_key}`,
    });

    const response = await fetch(this.API_URL + "reset", {
      method: "POST",
      headers: headers
    });
    if (response.ok) {
      const data = await response.json();
      return data.success;
    } else {
      switch(response.status){
        case 403:
          showErrorToast("El API key que tienes asignado es invalido.");

          break;
        case 401:
          showErrorToast("La cabecera con el API key es invalida.");
          break;
      }
      throw new Error(
        `Error sending message: ${response.status} ${response.statusText}`
      );
    }
  }

  async login(username: string, password: string): Promise<User | null> {
    const response = await fetch(this.API_URL + "login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // return User.from_dict(data.user);
        return new User(data.user.id, data.token, data.user.username, data.user.appointments)
      } else {
        return null;
      }
    } else {
      throw new Error(
        `Error sending message: ${response.status} ${response.statusText}`
      );
    }
  }

  async getBackendVersion(): Promise<string | null> {
    const response = await fetch(this.API_URL + "version", {
      method: "GET"
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