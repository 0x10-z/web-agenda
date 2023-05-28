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
    <div className="flex-none py-2 text-center text-xs text-gray-600">
      <span>Frontend v{process.env.REACT_APP_VERSION}</span> |{" "}
      <span>Backend v{backendVersion}</span>
    </div>
  );
};

export default Footer;
