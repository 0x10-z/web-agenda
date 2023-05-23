import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "react-toastify/dist/ReactToastify.css";
import {
  getCurrentIsoDate,
  getSelectedDateTime,
  getSelectedDateTimeString,
  showToast,
} from "../utils/util";
import { Appointment } from "models/Appointment";

interface ModalProps {
  title: string;
  selectedDay: Date;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (data: FormData) => void;
  onDelete?: (appointment_id: string) => Promise<void>;
  appointment?: Appointment;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  selectedDay,
  isOpen,
  onClose,
  onAccept,
  onDelete,
  appointment,
}) => {
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [description, setDescription] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(selectedDay);
  const formattedDate = getCurrentIsoDate(selectedDate).substring(0, 10);

  useEffect(() => {
    if (!isOpen) {
      setDescription("");
      setSelectedDate(new Date());
    } else if (appointment) {
      setTime(appointment.appointment_datetime.toLocaleTimeString());
      setSelectedDate(appointment.appointment_datetime);
      setDescription(appointment.description);
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1);
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      setSelectedDate(selectedDay);
      setDescription("");
    }
  }, [isOpen, selectedDay]);

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTime(event.target.value);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value);
    const localDate = new Date(
      selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
    );
    setSelectedDate(localDate);
  };

  const handleDayClick = (date: Date) => {
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    setSelectedDate(localDate);
  };

  const handleAccept = () => {
    const currentDateTime = new Date();
    const selectedDateTime = getSelectedDateTime(selectedDate, time);

    if (!appointment && selectedDateTime <= currentDateTime) {
      showToast("La cita debe ser posterior al momento actual.", "info");
      return;
    }

    if (description === "") {
      showToast("La cita debe contener una descripción", "info");
      return;
    }

    const formData = new FormData();
    if (appointment) {
      formData.append("id", appointment.id);
    }

    formData.append(
      "appointment_datetime",
      getSelectedDateTimeString(selectedDate, time)
    );
    formData.append("description", description);
    onAccept(formData);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.id === "modal-overlay") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50"
      id="modal-overlay"
      onClick={handleOverlayClick}>
      <div className="bg-white p-16 lg:w-1/3 md:w-1/2 flex flex-col justify-center items-center rounded-md shadow-md">
        <h1 className="font-bold text-2xl text-gray-800 text-center pb-4">
          {title}
        </h1>
        <Calendar
          className="w-full mb-4 shadow-md"
          value={selectedDate}
          onClickDay={handleDayClick}
          locale="es-ES"
        />
        {appointment && (
          <input type="hidden" value={appointment.id} name="id" />
        )}
        <input
          type="date"
          value={formattedDate}
          onChange={handleDateChange}
          className="w-full border p-2 mb-2 shadow-md"
          placeholder="Fecha"
        />
        <input
          type="time"
          value={time}
          onChange={handleTimeChange}
          className="w-full border p-2 mb-2 shadow-md"
          placeholder="Hora"
        />
        <textarea
          autoFocus
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 mb-2 shadow-md"
          placeholder="Descripción"
        />
        <div className="flex flex-row w-full justify-end mt-8">
          <button
            onClick={handleAccept}
            className="bg-blue-500 text-white px-4 py-2 mx-1 rounded-md">
            ✅ Aceptar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 mx-1 rounded-md">
            ↩️ Volver
          </button>
          {appointment && onDelete && (
            <button
              onClick={() => onDelete(appointment.id)}
              className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 mx-1 rounded-md">
              ❎ Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
