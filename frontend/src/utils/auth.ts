import { UserProps } from "models/User";

export class Auth {
  static storageKey = "session_agenda";

  static getToken(): UserProps | null {
    const item = localStorage.getItem(this.storageKey);
    if (item){
      console.log(item);
      return JSON.parse(item);
    }else{
      return null;
    }
  }

  static setToken(token: string) {
    localStorage.setItem(this.storageKey, token);
  }

  static removeToken() {
    localStorage.removeItem(this.storageKey);
  }

  static isLoggedIn() {
    return this.getToken() !== null;
  }
}