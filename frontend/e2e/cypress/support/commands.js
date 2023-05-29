// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add("login", (username, password) => {
  cy.visit("login");
  cy.get("form").within(() => {
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password, { log: false });
    cy.root().submit();
  });
  cy.url().should("include", "/");
});

Cypress.Commands.add("checkToast", (type) => {
  var title = "";
  switch (type) {
    case "info":
      title = "Info: ";

      cy.get(`[id='main-toast']`).should("be.visible").should("contain", title);
      break;

    case "error":
      title = "Error: ";
      cy.get(`[id='main-toast']`).should("be.visible").should("contain", title);
      break;

    case "success":
      cy.get(`[id='main-toast']`).should("be.visible");
      break;
  }
});

Cypress.Commands.add(
  "addNewAppointment",
  (dayOfTheMonth, timeIndex, description) => {
    cy.get('[data-testid="add-button"]').click();
    // Click on calendar
    cy.get('[data-testid="modal-calendar-day-' + dayOfTheMonth + '"]').click({
      force: true,
    });
    // Click on time
    cy.get("select").eq(0).select(timeIndex);
    // Write description
    cy.get("textarea").type(description);
    cy.get('[data-testid="add-or-update-button"]').click();
    //cy.refreshCalendar(dayOfTheMonth);
    cy.checkToast("success");
  }
);

Cypress.Commands.add("deleteAppointment", (dayOfTheMonth, description) => {
  cy.reload();
  // Click appointment
  cy.openAppointmentModal(dayOfTheMonth, description);

  cy.get('[data-testid="delete-button"]').click();
});

Cypress.Commands.add("appointmentExistsAt", (dayOfTheMonth, description) => {
  cy.reload();
  cy.get(`[data-testid="main-calendar-day-${dayOfTheMonth}"]`).click({
    force: true,
  });

  cy.get(`[data-testid="li-${description}"]`).should("be.visible");
});

Cypress.Commands.add("openAppointmentModal", (dayOfTheMonth, description) => {
  cy.reload();
  cy.get(`[data-testid="main-calendar-day-${dayOfTheMonth}"]`).click({
    force: true,
  });

  cy.get(`[data-testid="li-${description}"]`).should("exist");
  cy.get(`[data-testid="li-${description}"]`).click();
});

Cypress.Commands.add(
  "updateAppointment",
  (dayOfTheMonth, timeIndex, description, newDayOfTheMonth, newDescription) => {
    // Open the modal of the appointment to update
    cy.openAppointmentModal(dayOfTheMonth, description);

    // Check if update mode is on and the description matches the initial one
    cy.get("h1").should("be.visible").should("contain", "Actualizar");
    cy.get("textarea").should("be.visible").should("contain", description);

    // Change the time, description and day
    cy.get("select").eq(0).select(timeIndex);
    cy.get("textarea").clear().type(newDescription);
    cy.get('[data-testid="modal-calendar-day-' + newDayOfTheMonth + '"]').click(
      {
        force: true,
      }
    );

    // Save the appointment changes and verify that they were successful
    cy.get('[data-testid="add-or-update-button"]').click();
    cy.checkToast("success");
  }
);

Cypress.Commands.add("addModalIsOpening", () => {
  cy.get('[data-testid="add-button"]').click();
  cy.get("h1").should("be.visible").should("contain", "Crear");
});

Cypress.Commands.add("addModalIsClosing", () => {
  cy.get("h1").should("be.visible").should("contain", "Crear");
  cy.get('[data-testid="close-button"]').click();
});
