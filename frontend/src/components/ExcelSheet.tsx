import { User } from "models/User";
import React, { useEffect, useState } from "react";
import { ApiService } from "services/ApiService";
import { Auth } from "utils/auth";

interface ExcelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExcelSheet: React.FC<ExcelProps> = ({ isOpen, onClose }) => {
  const [subtotal, setSubtotal] = useState("");
  const [iva, setIva] = useState("");
  const [total, setTotal] = useState("");

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = Auth.getToken();
    if (token) {
      setUser(token);
    }
  }, []);

  const apiService = new ApiService(user!);

  const handleSubtotalChange = (event: React.FocusEvent<HTMLDivElement>) => {
    const newSubtotal = event.target.innerHTML;
    setSubtotal(newSubtotal);
    calculateIva(newSubtotal);
  };

  const calculateIva = (subtotal: string) => {
    const ivaPercentage = 0.21;
    const calculatedIva = parseFloat(subtotal) * ivaPercentage;
    const calculatedTotal = parseFloat(subtotal) + calculatedIva;
    setIva(calculatedIva.toFixed(2));
    setTotal(calculatedTotal.toFixed(2));
  };

  const handleGenerateODF = async () => {
    await apiService.generateOdfPage(total, subtotal, iva);
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
      <div className="bg-white p-16 lg:w-1/3 md:w-1/2 flex flex-col justify-center items-center rounded-md shadow-md">
        <div>
          <div>
            <label>Subtotal:</label>
            <div
              className="bg-red-500"
              contentEditable
              onBlur={handleSubtotalChange}
              dangerouslySetInnerHTML={{ __html: subtotal }}
            />
          </div>
          <div>
            <label>IVA:</label>
            <div>{iva}</div>
          </div>
          <div>
            <label>Total:</label>
            <div>{total}</div>
          </div>
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
            onClick={handleGenerateODF}
          >
            Generar ODF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelSheet;
