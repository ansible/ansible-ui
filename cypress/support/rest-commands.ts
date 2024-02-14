/// <reference types="cypress" />
import '@cypress/code-coverage/support';

Cypress.Commands.add('requestPost', function requestPost<
  ResponseT,
  RequestT = ResponseT,
>(url: string, body: Partial<RequestT>) {
  cy.getCookie('csrftoken').then((cookie) =>
    cy
      .request<ResponseT>({
        method: 'POST',
        url,
        body,
        headers: {
          'X-CSRFToken': cookie?.value,
          Referer: Cypress.config().baseUrl,
        },
      })
      .then((response) => response.body)
  );
});

Cypress.Commands.add('requestPut', function requestPost<
  ResponseT,
  RequestT = ResponseT,
>(url: string, body: Partial<RequestT>) {
  cy.getCookie('csrftoken').then((cookie) =>
    cy
      .request<ResponseT>({
        method: 'PUT',
        url,
        body,
        headers: {
          'X-CSRFToken': cookie?.value,
          Referer: Cypress.config().baseUrl,
        },
      })
      .then((response) => response.body)
  );
});

Cypress.Commands.add('requestPatch', function requestPost<
  ResponseT,
  RequestT = ResponseT,
>(url: string, body: Partial<RequestT>) {
  cy.getCookie('csrftoken').then((cookie) =>
    cy
      .request<ResponseT>({
        method: 'PATCH',
        url,
        body,
        headers: {
          'X-CSRFToken': cookie?.value,
          Referer: Cypress.config().baseUrl,
        },
      })
      .then((response) => response.body)
  );
});

Cypress.Commands.add('requestGet', function requestGet<T>(url: string) {
  return cy.request<T>({ method: 'GET', url }).then((response) => response.body);
});

Cypress.Commands.add(
  'requestDelete',
  function deleteFn(
    url: string,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) {
    cy.getCookie('csrftoken').then((cookie) =>
      cy.request({
        method: 'Delete',
        url,
        failOnStatusCode: options?.failOnStatusCode,
        headers: { 'X-CSRFToken': cookie?.value, Referer: Cypress.config().baseUrl },
      })
    );
  }
);

Cypress.Commands.add('requestPoll', function requestPoll<
  ResponseT,
  ResultT = ResponseT,
>(options: { url: string; check: (response: Cypress.Response<ResponseT>) => ResultT | undefined; interval?: number; timeout?: number }) {
  cy.request<ResponseT>(options.url).then((response) => {
    const result = options.check(response);
    if (result !== undefined) {
      cy.wrap(result);
    } else {
      cy.wait(options.interval ? options.interval : 1000).then(() => cy.requestPoll(options));
    }
  });
});
