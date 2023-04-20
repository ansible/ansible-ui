/* eslint-disable @typescript-eslint/no-namespace */
// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn offz
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import '@patternfly/patternfly/patternfly-base.css';

import { Page } from '@patternfly/react-core';
import 'cypress-react-selector';
import { mount } from 'cypress/react18';
import type { MountReturn } from 'cypress/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PageFramework } from '../../framework';
import { User } from '../../frontend/awx/interfaces/User';
import { ActiveUserProvider } from '../../frontend/common/useActiveUser';
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.

// based on typeof mount from Cypress. options and rerenderKey parameters
// have been removed, and the route object has been added.
// https://github.com/cypress-io/cypress/blob/f94100577a0267ada71a7ffa970df0c7eb20c903/npm/react18/src/index.ts#L50
interface IMount {
  (
    component: React.ReactNode,
    route?: {
      path: string;
      initialEntries: string[];
    }
  ): Cypress.Chainable<MountReturn>;
}
declare global {
  namespace Cypress {
    interface Chainable {
      mount: IMount;
    }
  }
  interface Window {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    process: any;
  }
}

Cypress.Commands.add('mount', (component, route) => {
  cy.fixture('activeUser').then((activeUser: User) => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/me/',
        hostname: 'localhost',
      },
      {
        activeUser,
      }
    );
  });
  return mount(
    <MemoryRouter initialEntries={route?.initialEntries || ['/1']}>
      <PageFramework>
        <ActiveUserProvider>
          <Page>
            <Routes>
              <Route path={`${route?.path || '/:id'}`} element={component} />
            </Routes>
          </Page>
        </ActiveUserProvider>
      </PageFramework>
    </MemoryRouter>,
    {},
    undefined
  );
});

// Example use:
// cy.mount(<MyComponent />)
// cy.mount(<MyComponent />, {
//   path: 'ui_next/credentials/:id',
//   initialEntries: ['ui_next/credentials/1']
// })

before(() => {
  window.process = {
    // To avoid the ReferenceError – process is not defined
    env: {
      NODE_ENV: 'development',
    },
  };
});
