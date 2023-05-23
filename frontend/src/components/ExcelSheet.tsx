import React, { useState } from "react";
import { pdf, Document, Page, Text, StyleSheet } from "@react-pdf/renderer";
import ReactPDF from "@react-pdf/renderer";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 12,
    paddingTop: 35,
    paddingLeft: 35,
    paddingRight: 35,
    paddingBottom: 65,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  text: {
    margin: 10,
    fontSize: 14,
    textAlign: "justify",
  },
});

const ExcelSheet: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [subtotal, setSubtotal] = useState("");
  const [iva, setIva] = useState("");
  const [total, setTotal] = useState("");

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
    // Send to fastapi in order to download something
    const response = await fetch("http://localhost:5000/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subtotal,
        iva,
        total,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "document.odt";
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Manejo de errores en caso de que la generación del archivo falle.
      console.log("Error al generar el archivo PDF");
    }
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
      onClick={handleOverlayClick}>
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
            onClick={handleGenerateODF}>
            Generar ODF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelSheet;
