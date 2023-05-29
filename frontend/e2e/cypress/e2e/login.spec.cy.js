describe("Login", () => {
  it("Login successfully", () => {
    // prepare
    const username = "user";
    const password = "user";

    // act
    cy.login(username, password);

    // assert
    cy.url().should("include", "/");
  });

  it("Login error", () => {
    // prepare
    const username = "incorrectuser";
    const password = "incorrectpassword";

    // act
    cy.login(username, password);

    // assert
    cy.checkToast("error");
  });
});
