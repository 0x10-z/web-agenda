import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Modal } from "./Modal";
import { showErrorToast } from "../utils/util";
import React from "react";
import { User } from "models/User";
import { Appointment } from "models/Appointment";
import { Tooltip } from "react-tooltip";

interface BodyProps {
  user: User;
}

export default function Body({ user }: BodyProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [eventList, setEventList] = useState<Appointment[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchEvents(selectedDate);
  }, []);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setModalOpen(false);
  };

  // CREATE
  const handleAcceptModal = async (data: FormData) => {
    const formDataObj = Object.fromEntries(data.entries());
    const jsonData = JSON.stringify(formDataObj);

    try {
      const response = await fetch("http://localhost:5000/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.api_key}`,
        },
        body: jsonData,
      });

      if (response.ok) {
        //const data = await response.json();
        //setEventList(data.appointments);
        fetchEvents(selectedDate!);
        showErrorToast("El formulario se ha enviado correctamente");
      } else {
        showErrorToast("Error al enviar el formulario");
      }
    } catch (error) {
      showErrorToast("Error al enviar el formulario:" + error);
    }
  };

  // UPDATE
  const handleAcceptModalToModifyAnElement = async (data: FormData) => {
    const formDataObj = Object.fromEntries(data.entries());
    const jsonData = JSON.stringify(formDataObj);
    try {
      const response = await fetch(
        "http://localhost:5000/appointments/" + formDataObj.id,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.api_key}`,
          },
          body: jsonData,
        }
      );

      if (response.ok) {
        //const data = await response.json();
        //setEventList(data.appointments);
        fetchEvents(selectedDate!);
        showErrorToast("El formulario se ha enviado correctamente");
      } else {
        showErrorToast("Error al enviar el formulario");
      }
    } catch (error) {
      showErrorToast("Error al enviar el formulario:" + error);
    }
  };

  const handleOpenModalToModifyAnElement = (event: Appointment) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const fetchEvents = async (date: Date) => {
    const formattedDate = date.toISOString().substring(0, 10);
    try {
      const response = await fetch(
        `http://localhost:5000/appointments?date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${user.api_key}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data.appointments);

        setEventList(
          data.appointments.map(
            (appointment: any) =>
              new Appointment(
                appointment.id,
                appointment.description,
                appointment.appointment_datetime,
                appointment.user_id,
                appointment.created_at
              )
          )
        );
      } else {
        showErrorToast("Error al obtener la lista de eventos");
      }
    } catch (error) {
      showErrorToast("Error al obtener la lista de eventos: " + error);
    }
  };

  const handleOnDelete = async (appointment_id: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/appointments/${appointment_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.api_key}`,
          },
        }
      );
      if (response.ok) {
        fetchEvents(selectedDate!);
      } else {
        showErrorToast("Error al obtener la lista de eventos");
      }
    } catch (error) {
      showErrorToast("Error al obtener la lista de eventos: " + error);
    }
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

  const formattedDate = selectedDate?.toISOString().substring(0, 10);

  return (
    <div className="flex-grow lg:mx-80">
      <div className="flex flex-col justify-around bg-white rounded-md m-10 h-full">
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
              <ul className="flex-1 flex flex-col justify-start max-h-[500px] overflow-y-auto">
                {eventList &&
                  eventList.map((event: Appointment, index) => (
                    <li
                      key={index}
                      data-tooltip-id="tooltip"
                      data-tooltip-content={`Creado el ${event.createdAtTime()}`}
                      onClick={() => handleOpenModalToModifyAnElement(event)}
                      className={`rounded p-2 hover:bg-gray-700 hover:text-white hover:cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-200"
                      }`}
                    >
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
        </div>
        {selectedEvent ? (
          <Modal
            title="Actualizar"
            isOpen={modalOpen}
            onClose={handleCloseModal}
            onAccept={handleAcceptModalToModifyAnElement}
            onDelete={handleOnDelete}
            appointment={selectedEvent}
          />
        ) : (
          <Modal
            title="Crear"
            isOpen={modalOpen}
            onClose={handleCloseModal}
            onAccept={handleAcceptModal}
          />
        )}
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
