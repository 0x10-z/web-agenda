const appointments = [
  {
    day: 17,
    hourIndex: 3,
    hour: "09:00",
    description: "My appointment",
  },
  {
    day: 18,
    hourIndex: 4,
    hour: "09:30",
    description: "Another appointment",
  },
  {
    day: 19,
    hourIndex: 5,
    hour: "10:00",
    description: "Yet another appointment",
  },
];

const updateAppointments = [
  {
    day: 5,
    newDay: 6,
    hourIndex: 10,
    hour: "12:30",
    description: "First appointment",
    newDescription: "New first appointment",
  },
  {
    day: 7,
    newDay: 8,
    hourIndex: 15,
    hour: "15:30",
    description: "Second appointment",
    newDescription: "New second appointment",
  },
  {
    day: 9,
    newDay: 10,
    hourIndex: 6,
    hour: "16:00",
    description: "Third appointment",
    newDescription: "New third appointment",
  },
  {
    day: 11,
    newDay: 12,
    hourIndex: 17,
    hour: "16:30",
    description: "Fourth appointment",
    newDescription: "New fourth appointment",
  },
];

describe("Appointment", () => {
  it("Open and close modal", () => {
    // prepare
    const username = "user";
    const password = "user";
    cy.login(username, password);

    cy.addModalIsOpening();
    cy.addModalIsClosing();
  });

  it("Update existing appointment", () => {
    // prepare
    const username = "user";
    const password = "user";
    cy.login(username, password);

    updateAppointments.forEach((appointment) => {
      cy.addNewAppointment(
        appointment.day,
        appointment.hourIndex,
        appointment.description
      );

      // act
      cy.updateAppointment(
        appointment.day,
        appointment.hourIndex,
        appointment.hour,
        appointment.description,
        appointment.newDay,
        appointment.newHourIndex,
        appointment.newDescription
      );

      // // assert
      cy.appointmentExistsAt(appointment.newDay, appointment.newDescription);

      cy.url().should("include", "/");
    });
  });

  it("Add new appointment", () => {
    // prepare
    const username = "user";
    const password = "user";
    cy.login(username, password);

    appointments.forEach((appointment) => {
      // act
      cy.addNewAppointment(
        appointment.day,
        appointment.hourIndex,
        appointment.description
      );

      // assert
      cy.appointmentExistsAt(appointment.day, appointment.description);

      // teardown
      cy.deleteAppointment(appointment.day, appointment.description);

      cy.url().should("include", "/");
    });
  });
});
