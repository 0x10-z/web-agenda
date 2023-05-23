import { ApiService } from "services/ApiService";
import { Globals } from "Globals";

const Footer = () => {
  return (
    <div className="flex-none px-3 pt-2 pb-3 text-center text-xs text-gray-600 md:px-4 md:pt-3 md:pb-6">
      <span>Frontend v{process.env.REACT_APP_VERSION}</span> |{" "}
      <span>Backend v{Globals.BACKEND_VERSION}</span>
    </div>
  );
};

export default Footer;
