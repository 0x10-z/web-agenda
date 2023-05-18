import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (data: FormData) => void;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onAccept }) => {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [texto, setTexto] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const formattedDate = selectedDate?.toISOString().substring(0, 10);

  const handleAccept = () => {
    const formData: FormData = { fecha, hora, texto };
    onAccept(formData);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const handleDateChange = (event: any) => {
    const selectedDate = new Date(event.target.value);
    setSelectedDate(selectedDate);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-md shadow-md">
        <Calendar
          className="w-full mb-4"
          value={selectedDate}
          onClickDay={setSelectedDate}
          locale="es-ES"
        />
        <input
          type="date"
          value={formattedDate}
          onChange={handleDateChange}
          className="w-full border p-2 mb-2"
          placeholder="Fecha"
        />
        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="w-full border p-2 mb-2"
          placeholder="Hora"
        />
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="w-full border p-2 mb-2"
          placeholder="Texto"
        />
        <div className="flex justify-end">
          <button
            onClick={handleAccept}
            className="bg-blue-500 text-white px-4 py-2 mr-2 rounded-md"
          >
            Aceptar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};
