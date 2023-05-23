import { Globals } from "Globals";
import { useEffect, useState } from "react";

const Footer = () => {
  const [backendVersion, setBackendVersion] = useState<string>("");

  useEffect(() => {
    const fetchBackendVersion = async () => {
      try {
        const version = await Globals.getBackendVersion();
        setBackendVersion(version!);
      } catch (error) {
        console.error("Error fetching backend version:", error);
      }
    };

    fetchBackendVersion();
  }, []);

  return (
    <div className="flex-none px-3 pt-2 pb-3 text-center text-xs text-gray-600 md:px-4 md:pt-3 md:pb-6">
      <span>Frontend v{process.env.REACT_APP_VERSION}</span> |{" "}
      <span>Backend v{backendVersion}</span>
    </div>
  );
};

export default Footer;
