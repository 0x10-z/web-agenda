import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "react-toastify/dist/ReactToastify.css";
import {
  getCurrentIsoDate,
  getSelectedDateTime,
  getSelectedDateTimeString,
  showToast,
} from "../../utils/util";
import { Appointment } from "models/Appointment";
import {
  faTrash,
  faSync,
  faArrowLeft,
  faPlusSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalBase from "./ModalBase";

interface AppointmentModalProps {
  selectedDay: Date;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (data: FormData) => void;
  onDelete?: (appointment_id: string) => Promise<void>;
  appointment?: Appointment;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  selectedDay,
  isOpen,
  onClose,
  onAccept,
  onDelete,
  appointment,
}) => {
  const timeOptions: string[] = generateTimeSlots();

  const [time, setTime] = useState<string>(timeOptions[0]);
  const [description, setDescription] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(selectedDay);
  const formattedDate = getCurrentIsoDate(selectedDate).substring(0, 10);

  useEffect(() => {
    if (!isOpen) {
      // On close, modal cleaned
      setDescription("");
      setSelectedDate(new Date());
    } else if (appointment) {
      // If update, set appointment data
      setTime(appointment.appointment_datetime.toLocaleTimeString());
      setSelectedDate(appointment.appointment_datetime);
      setDescription(appointment.description);
    } else {
      // If its new, initialize displayed info
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1);
      setTime(timeOptions[0]);
      setSelectedDate(selectedDay);
      setDescription("");
    }
  }, [isOpen, selectedDay]);

  const handleTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
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

    // if (!appointment && selectedDateTime <= currentDateTime) {
    //   showToast("La cita debe ser posterior al momento actual.", "info");
    //   return;
    // }

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

  return (
    <ModalBase
      title={appointment ? "Actualizar" : "Crear"}
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <Calendar
        className="w-full mb-4 shadow-md"
        value={selectedDate}
        onClickDay={handleDayClick}
        locale="es-ES"
      />
      {appointment && <input type="hidden" value={appointment.id} name="id" />}
      <input
        type="date"
        value={formattedDate}
        onChange={handleDateChange}
        className="w-full border p-2 mb-2 shadow-md"
        placeholder="Fecha"
      />
      <select
        value={time.slice(0, 5)}
        onChange={(e) => handleTimeChange(e)}
        className="w-full border p-2 mb-2 shadow-md"
      >
        {timeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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
          className="bg-blue-500 text-white px-4 py-2 mx-1 rounded-md"
        >
          {appointment ? (
            <>
              <FontAwesomeIcon icon={faSync} /> Actualizar
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlusSquare} /> Crear
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 mx-1 rounded-md"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>
        {appointment && onDelete && (
          <button
            onClick={() => onDelete(appointment.id)}
            className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 mx-1 rounded-md"
          >
            <FontAwesomeIcon icon={faTrash} /> Eliminar
          </button>
        )}
      </div>
    </ModalBase>
  );
};

export default AppointmentModal;

function generateTimeSlots() {
  // Nuevo código para generar las opciones de tiempo de 30 minutos
  const timeOptions: string[] = [];
  const startTime = new Date();
  startTime.setHours(7, 30, 0, 0); // Establece la hora de inicio en 00:00:00
  const endTime = new Date();
  endTime.setHours(20, 30, 0, 0); // Establece la hora de fin en 23:30:00

  let currentTime = startTime;
  while (currentTime <= endTime) {
    const formattedTime = currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    timeOptions.push(formattedTime);
    currentTime.setMinutes(currentTime.getMinutes() + 30);
  }

  return timeOptions;
}
