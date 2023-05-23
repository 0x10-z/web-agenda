import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Modal } from "./Modal";
import React from "react";
import { User } from "models/User";
import { Appointment } from "models/Appointment";
import { Tooltip } from "react-tooltip";
import { ApiService } from "services/ApiService";
import { getCurrentIsoDate } from "utils/util";

interface MonthlyAppointmentsProps {
  day: number;
  month: number;
  appointments: number;
}

interface BodyProps {
  user: User;
}

export default function Body({ user }: BodyProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventList, setEventList] = useState<Appointment[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [monthlyEvents, setMonthlyEvents] =
    useState<MonthlyAppointmentsProps[]>();

  const apiService = new ApiService(user);

  useEffect(() => {
    const fetchMonthlyAppointments = async () => {
      const appointments = await apiService.fetchAppointmentsByMonth(
        selectedDate
      );
      setMonthlyEvents(appointments);
    };

    fetchMonthlyAppointments();
  }, []);

  useEffect(() => {
    fetchEvents(selectedDate);
  }, []);

  const handleOpenModal = (
    event?: React.MouseEvent<HTMLButtonElement> | Appointment
  ) => {
    setSelectedEvent(event instanceof Appointment ? event : null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  const handleCreateAppointment = async (data: FormData) => {
    await apiService.submitFormData(data, "appointments/", "POST");
    await fetchEvents(selectedDate!);
  };

  const handleUpdateAppointment = async (data: FormData) => {
    const formDataObj = Object.fromEntries(data.entries());
    const appointmentId = formDataObj.id;
    await apiService.submitFormData(
      data,
      `appointments/${appointmentId}`,
      "PUT"
    );
    await fetchEvents(selectedDate!);
  };

  const fetchEvents = async (date: Date) => {
    const appointments = await apiService.fetchEvents(date);
    setEventList(appointments);
  };

  const handleOnDelete = async (appointment_id: string) => {
    await apiService.deleteAppointment(appointment_id);
    await fetchEvents(selectedDate!);
    setIsModalOpen(false);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value);
    const localDate = new Date(
      selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
    );
    setSelectedDate(localDate);
    fetchEvents(localDate);
  };

  const handleDayClick = (date: Date) => {
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    setSelectedDate(localDate);
    fetchEvents(localDate);
  };

  const daysWithAppointments = ({
    date,
    view,
  }: {
    date: Date;
    view: string;
  }) => {
    if (view === "month" && monthlyEvents) {
      const dayOfMonth = date.getDate();
      const month = date.getMonth();
      const foundAppointment = monthlyEvents.find(
        (appointment) =>
          appointment.day === dayOfMonth && appointment.month == month + 1
      );

      if (foundAppointment && foundAppointment.appointments > 0) {
        return "🕮";
      }
    }
  };

  const formattedDate = getCurrentIsoDate(selectedDate).substring(0, 10);

  const modalTitle = selectedEvent ? "Actualizar" : "Crear";
  const modalProps = selectedEvent
    ? {
        onAccept: handleUpdateAppointment,
        onDelete: handleOnDelete,
        appointment: selectedEvent,
      }
    : {
        onAccept: handleCreateAppointment,
      };
  return (
    <div className="flex-grow md:mx-10 lg:mx-40 xl:mx-80">
      <div className="flex flex-col justify-around bg-white rounded-md m-10 h-full">
        <div className="flex flex-row">
          <div className="flex-1">
            <div
              id="left-sidebar"
              className="flex flex-col h-full overflow-hidden p-4">
              <div className="flex justify-center pb-4">
                <h1 className="font-bold pb-2 text-2xl text-gray-800">
                  {getDateTitle(selectedDate)}
                </h1>
              </div>
              <input
                type="date"
                className="sm:flex md:hidden lg:hidden mb-4 p-2 border border-gray-300 rounded"
                value={formattedDate}
                onChange={handleDateChange}
              />
              <ul className="flex-1 flex flex-col justify-start max-h-[500px] overflow-y-auto">
                {eventList &&
                  eventList.map((event: Appointment, index) => (
                    <li
                      key={event.id}
                      data-tooltip-id="tooltip"
                      data-tooltip-content={`Creado el ${event.createdAtTime()}`}
                      onClick={() => handleOpenModal(event)}
                      className={`rounded p-2 hover:bg-gray-700 hover:text-white hover:cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      }`}>
                      {index + 1} - {event.description} - {event.localeTime()}
                    </li>
                  ))}
                <Tooltip
                  id={`tooltip`}
                  place="right"
                  style={{ backgroundColor: "black" }}
                />
              </ul>
            </div>
          </div>
          <div
            id="right-sidebar"
            className="hidden md:flex md:flex-1 p-4 flex-col justify-center items-center">
            <input
              type="date"
              className="flex mb-4 p-2 border border-gray-300 rounded"
              value={formattedDate}
              onChange={handleDateChange}
            />
            <Calendar
              className="w-full mb-4"
              value={selectedDate}
              onClickDay={handleDayClick}
              showWeekNumbers={true}
              tileContent={daysWithAppointments}
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
            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 m-2 rounded">
            Añadir
          </button>
        </div>
        <Modal
          title={modalTitle}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          {...modalProps}
        />
      </div>
    </div>
  );
}

function getDateTitle(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("es-ES", options);
}
