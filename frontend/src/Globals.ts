import { ApiService } from "services/ApiService";
import packageJson from "../package.json";

export class Globals {
  static API_URL = process.env.REACT_APP_API_URL || "";
  static FRONTEND_VERSION = packageJson.version || "Version Not Found";
  private static BACKEND_VERSION: string | null;

  static async getBackendVersion() {
    if (!Globals.BACKEND_VERSION) {
      try {
        Globals.BACKEND_VERSION = await ApiService.getBackendVersion();
      } catch (error) {
        console.error("Error fetching backend version:", error);
        Globals.BACKEND_VERSION = "Version Not Found";
      }
    }
    return Globals.BACKEND_VERSION;
  }
}
