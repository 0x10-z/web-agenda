import React, { useState } from "react";
import { ExcelSheetModal } from "components/modals/ExcelSheetModal";
import {
  faChartBar,
  faCut,
  faDatabase,
  faFileExcel,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DbImporterModal } from "./modals/DbImporterModal";
import { StatsModal } from "./modals/StatsModal";
interface NavbarProps {
  handleLogout: () => void;
}

export default function Navbar({ handleLogout }: NavbarProps) {
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isDbImportModalOpen, setIsDbImportModalOpen] = useState(false);

  const handleOpenModalStats = (
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    setIsStatsModalOpen(true);
  };

  const handleStatsCloseModal = () => {
    setIsStatsModalOpen(false);
  };

  const handleOpenModalExcel = (
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    setIsExcelModalOpen(true);
  };

  const handleExcelCloseModal = () => {
    setIsExcelModalOpen(false);
  };

  const handleOpenModalDbImport = (
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    setIsDbImportModalOpen(true);
  };

  const handleCloseModalDbImport = () => {
    setIsDbImportModalOpen(false);
  };

  return (
    <header className="text-gray-900 dark:text-white">
      <nav className="border-b dark:border-gray-900 border-gray-200 container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <img
            src="/favicon/android-chrome-192x192.png"
            width={40}
            height={40}
            alt="Logo"
            className="h-10 mr-3 rounded-md shadow-sm"
          />
          <span className="font-bold text-xl tracking-tight">
            <FontAwesomeIcon icon={faCut} />
            {" - "}
            Agenda
          </span>
        </div>
        <div className="flex dark:text-black">
          <button
            onClick={handleOpenModalStats}
            className="btn  bg-orange-500 hover:bg-orange-700 text-white py-2 px-4 m-2 rounded"
          >
            <FontAwesomeIcon icon={faChartBar} /> Estadisticas
          </button>

          <button
            onClick={handleOpenModalExcel}
            className="btn  bg-green-500 hover:bg-green-700 text-white py-2 px-4 m-2 rounded"
          >
            <FontAwesomeIcon icon={faFileExcel} /> Crear hoja de cálculo
          </button>

          <button
            onClick={handleOpenModalDbImport}
            className="btn  bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 m-2 rounded"
          >
            <FontAwesomeIcon icon={faDatabase} /> Importar DB
          </button>

          <button
            onClick={handleLogout}
            className="btn  bg-red-500 hover:bg-red-700 text-white py-2 px-4 m-2 rounded"
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar sesión
          </button>
        </div>
      </nav>
      <StatsModal isOpen={isStatsModalOpen} onClose={handleStatsCloseModal} />
      <ExcelSheetModal
        isOpen={isExcelModalOpen}
        onClose={handleExcelCloseModal}
      />
      <DbImporterModal
        isOpen={isDbImportModalOpen}
        onClose={handleCloseModalDbImport}
      />
    </header>
  );
}
