import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "react-toastify/dist/ReactToastify.css";
import { showErrorToast } from "../utils/util";
import { Appointment } from "models/Appointment";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (data: FormData) => void;
  onDelete: ((appointment_id: string) => Promise<void>) | null;
  appointment: Appointment | null;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  isOpen,
  onClose,
  onAccept,
  onDelete = null,
  appointment = null,
}) => {
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [description, setDescription] = useState<string>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const formattedDate = selectedDate?.toISOString().substring(0, 10);

  useEffect(() => {
    if (appointment) {
      setTime(appointment.appointment_datetime.toLocaleTimeString());
      setSelectedDate(appointment.appointment_datetime);
      setDescription(appointment.description);
    } else {
      // Set current next minute.
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1);
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      setDescription("");
    }

    if (!isOpen) {
      setDescription("");
      setSelectedDate(new Date());
    }
  }, [isOpen]);

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
      showErrorToast("La cita debe ser posterior al momento actual.");
      return;
    }

    if (description === "") {
      showErrorToast("La cita debe contener una descripción");
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
    formData.append("description", description!);
    onAccept(formData);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event: any) => {
    if (event.target.id === "modal-overlay") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50"
      id="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="bg-white p-16 w-1/2 flex flex-col justify-center items-center rounded-md shadow-md">
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 mb-2 shadow-md"
          placeholder="Descripción"
        />
        <div className="flex flex-row w-full justify-end">
          <button
            onClick={handleAccept}
            className="bg-blue-500 text-white px-4 py-2 mx-1 rounded-md"
          >
            Aceptar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 mx-1 rounded-md"
          >
            Volver
          </button>
          {appointment && onDelete && (
            <button
              onClick={() => onDelete(appointment.id)}
              className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 mx-1 rounded-md"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const getSelectedDateTime = (currentDate: Date, currentTime: string) => {
  return new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    parseInt(currentTime.split(":")[0]),
    parseInt(currentTime.split(":")[1])
  );
};

const getSelectedDateTimeString = (currentDate: Date, currentTime: string) => {
  const date = getSelectedDateTime(currentDate, currentTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
