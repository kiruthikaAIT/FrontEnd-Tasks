import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { mount } from "cypress/react";
import '@testing-library/cypress/add-commands';
import Register from "../../src/pages/register";
const mockStore = configureStore([]);
describe("Register Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: { user: null, loading: false, error: null },
    });
  });
  it("renders correctly", () => {
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>
    );
    cy.findByLabelText("Name").should("exist");
    cy.findByLabelText("Email").should("exist");
    cy.findByLabelText("Password").should("exist");
    cy.contains("Register").should("exist");
  });

  it("allows typing in inputs", () => {
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>
    );
    cy.findByLabelText("Name").type("John Doe").should("have.value", "John Doe");
    cy.findByLabelText("Email").type("john@example.com").should("have.value", "john@example.com");
    cy.findByLabelText("Password").type("password123").should("have.value", "password123");
  });
});
