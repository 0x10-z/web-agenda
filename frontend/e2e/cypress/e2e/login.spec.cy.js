// describe("template spec", () => {
//   it("passes", () => {
//     cy.visit("http://localhost:3000");
//   });
// });
describe("Login", () => {
  it("Login successfully", () => {
    // Utilizar Cypress.env para obtener el usuario y contraseña desde la línea de comandos
    // const username = Cypress.env("username");
    //const password = Cypress.env("password");
    const username = "user";
    const password = "user";

    // Realizar la autenticación
    cy.login(username, password);

    // Verificación
    cy.url().should("include", "/");
  });

  it("Login error", () => {
    // Utilizar Cypress.env para obtener el usuario y contraseña desde la línea de comandos
    // const username = Cypress.env("username");
    //const password = Cypress.env("password");
    const username = "incorrectuser";
    const password = "incorrectpassword";

    // Realizar la autenticación
    cy.login(username, password);

    // Verificación
    //cy.get('[data-testid="status-toaster"]')
    cy.get(`[id='main-toast']`)
      .should("be.visible")
      .should(
        "contain",
        "Error: El nombre de usuario o contraseña son incorrectos.."
      );
  });
});
