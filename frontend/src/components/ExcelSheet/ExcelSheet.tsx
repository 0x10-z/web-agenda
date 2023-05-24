import React from "react";
import { ExcelSheetContent } from "./ExcelSheetContent";

interface ExcelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExcelSheet: React.FC<ExcelProps> = ({ isOpen, onClose }) => {
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
      <ExcelSheetContent />
    </div>
  );
};

export default ExcelSheet;
