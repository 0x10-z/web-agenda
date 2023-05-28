import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import AppointmentModal from "./modals/AppointmentModal";
import React from "react";
import { User } from "models/User";
import { Appointment } from "models/Appointment";
import { Tooltip } from "react-tooltip";
import { ApiService } from "services/ApiService";
import { getCurrentIsoDate } from "utils/util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusSquare, faTag } from "@fortawesome/free-solid-svg-icons";

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
  }, [selectedDate]);

  useEffect(() => {
    fetchEvents(selectedDate);
  }, [selectedDate]);

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
    await apiService.submitFormData(data, "appointments", "POST");
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
        const appointments = foundAppointment.appointments;

        const tagColor =
          appointments < 5 ? "green" : appointments < 9 ? "orange" : "red";

        return (
          <FontAwesomeIcon
            icon={faTag}
            size="sm"
            className="mt-1 ml-1"
            style={{ color: tagColor }}
          />
        );
        //return "🔖";
      }
    }
  };

  const formattedDate = getCurrentIsoDate(selectedDate).substring(0, 10);

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
    <div className="flex-grow mx-auto max-w-screen-lg">
      <div className="flex flex-col justify-around bg-white rounded-md h-full border border-slate-300">
        <div className="flex flex-row">
          <div className="flex-1">
            <div
              id="left-sidebar"
              className="flex flex-col h-full overflow-hidden p-4"
            >
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
              <ul className="flex-1 flex flex-col justify-start min-h-[450px] max-h-[450px] overflow-y-auto">
                {eventList.length > 0 ? (
                  eventList.map((event: Appointment, index) => (
                    <li
                      key={event.id}
                      data-tooltip-id="tooltip"
                      data-tooltip-content={`Creado el ${event.createdAtTime()}`}
                      onClick={() => handleOpenModal(event)}
                      className={`rounded p-2 hover:bg-gray-700 hover:text-white hover:cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      }`}
                    >
                      {index + 1} - {event.description} - {event.localeTime()}
                    </li>
                  ))
                ) : (
                  <p>No hay citas disponibles.</p>
                )}
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
            className="hidden md:flex md:flex-1 p-4 flex-col justify-center items-center"
          >
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
              tileContent={daysWithAppointments}
              locale="es-ES"
            />
            <img
              alt="h2u-logo-picture"
              src="/paredh2u.png"
              width={400}
              height={330}
              className="rounded-md shadow-sm"
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row mx-4 my-2">
          <button
            onClick={handleOpenModal}
            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            <FontAwesomeIcon icon={faPlusSquare} size="lg" className="mr-2" />
            Añadir
          </button>
        </div>
        <AppointmentModal
          selectedDay={selectedDate}
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
