import { User } from "models/User";
import React, { useEffect, useState } from "react";
import { ApiService } from "services/ApiService";
import { Auth } from "utils/auth";
import Decimal from "decimal.js";
import { ExcelSheetContent } from "./ExcelSheetContent";

declare global {
  interface String {
    replaceCommas(): string;
  }
}

String.prototype.replaceCommas = function (): string {
  return this.replace(",", ".");
};

interface ExcelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExcelSheet: React.FC<ExcelProps> = ({ isOpen, onClose }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = Auth.getToken();
    if (token) {
      setUser(token);
    }
  }, []);

  const apiService = new ApiService(user!);

  const handleGenerateODF = async () => {
    await apiService.generateOdfPage("total", "subtotal", "");
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.id === "modal-overlay") {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50"
      id="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="bg-white p-16 lg:w-1/2 md:w-2/3 flex flex-col justify-center items-center rounded-md shadow-md">
        <div className="container mx-auto py-4">
          <ExcelSheetContent />
        </div>
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
          onClick={handleGenerateODF}
        >
          Generar Informe
        </button>
      </div>
    </div>
  );
};

export default ExcelSheet;
