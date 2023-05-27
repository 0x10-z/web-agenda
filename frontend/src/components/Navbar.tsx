import React, { useState } from "react";
import ExcelSheet from "components/ExcelSheet/ExcelSheet";
import {
  faCut,
  faFileExcel,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface NavbarProps {
  handleLogout: () => void;
}

export default function Navbar({ handleLogout }: NavbarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = (event?: React.MouseEvent<HTMLButtonElement>) => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <header className="text-gray-900 dark:text-white">
      <nav className="border-b dark:border-gray-900 border-gray-200 container mx-auto flex flex-wrap items-center justify-between p-5">
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
            onClick={handleOpenModal}
            className="btn  bg-green-500 hover:bg-green-700 text-white py-2 px-4 m-2 rounded"
          >
            <FontAwesomeIcon icon={faFileExcel} /> Crear hoja de cálculo
          </button>
          <button
            onClick={handleLogout}
            className="btn  bg-red-500 hover:bg-red-700 text-white py-2 px-4 m-2 rounded"
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar sesión
          </button>
        </div>
      </nav>
      <ExcelSheet isOpen={isModalOpen} onClose={handleCloseModal} />
    </header>
  );
}
