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
      <ExcelSheetContent />
    </div>
  );
};

export default ExcelSheet;
