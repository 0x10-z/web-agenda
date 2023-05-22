import { ApiService } from 'services/ApiService';
import packageJson from '../package.json';

export class Globals {
  static API_URL = process.env.REACT_APP_API_URL || "";
  static FRONTEND_VERSION = packageJson.version || "Version Not Found";

  static async getBackendVersion() {
    const backendVersion = await ApiService.getBackendVersion() || "Version Not Found";
    return backendVersion;
  }
}