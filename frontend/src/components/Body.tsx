import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Modal } from "./Modal";
import { showErrorToast } from "../utils/util";
import React from "react";

export default function Body() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleAcceptModal = async (data: FormData) => {
    const formDataObj = Object.fromEntries(data.entries());
    const jsonData = JSON.stringify(formDataObj);

    try {
      const response = await fetch("api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonData,
      });

      if (response.ok) {
        showErrorToast("El formulario se ha enviado correctamente");
      } else {
        showErrorToast("Error al enviar el formulario");
      }
    } catch (error) {
      showErrorToast("Error al enviar el formulario:" + error);
    }
  };

  const handleDateChange = (event: any) => {
    const selectedDate = new Date(event.target.value);
    setSelectedDate(selectedDate);
  };

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const formattedDate = selectedDate?.toISOString().substring(0, 10);

  return (
    <div className="flex-grow lg:mx-80">
      <div className="flex flex-col justify-around bg-white rounded-md m-10 h-full">
        <div className="flex flex-row">
          <div className="flex-1">
            <div
              id="left-sidebar"
              className="flex flex-col h-full overflow-hidden p-10"
            >
              <input
                type="date"
                className="flex mb-4 p-2 border border-gray-300 rounded"
                value={formattedDate}
                onChange={handleDateChange}
              />
              <ul className="flex-1 flex flex-col justify-center">
                <li>aitor</li>
                <li>iker</li>
              </ul>
            </div>
          </div>
          <div
            id="right-sidebar"
            className="hidden md:flex md:flex-1 p-4 flex-col justify-center items-center bg-red-800"
          >
            <Calendar
              className="w-full mb-4"
              value={selectedDate}
              onClickDay={setSelectedDate}
              locale="es-ES"
            />
            <img
              alt="h2u-logo-picture"
              src="/paredh2u.jpg"
              width={600}
              height={430}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row m-4">
          <button
            onClick={handleOpenModal}
            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 m-2 rounded"
          >
            Añadir
          </button>
          <button className="flex-1 bg-green-500 hover:bg-green-700 text-white py-2 px-4 m-2 rounded">
            Modificar
          </button>
          <button className="flex-1 bg-red-500 hover:bg-red-700 text-white py-2 px-4 m-2 rounded">
            Eliminar
          </button>
        </div>
        <Modal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onAccept={handleAcceptModal}
        />
      </div>
    </div>
  );
}
