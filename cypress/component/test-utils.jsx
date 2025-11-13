// cypress/component/test-utils.jsx
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

const mockStore = configureStore([]);

export const mountWithProviders = (component, initialState = {}) => {
  const store = mockStore(initialState);

  return cy.mount(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
};
