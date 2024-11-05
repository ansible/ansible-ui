import { BrowserContext, test } from '@playwright/test';
import chalk from 'chalk';
import getValue from 'get-value';
import { Project } from '../../frontend/awx/interfaces/Project';
import { platformUI, platformURL } from '../commands/login';
import { IApiData, mockData } from './mockData';
import { mockOptions } from './mockOptions';

export function mock({ context }: { context: BrowserContext }) {
  const mockEnabled = (test.info().project.metadata as { mock?: boolean }).mock;
  if (!mockEnabled) return;
  const data = JSON.parse(JSON.stringify(mockData)) as IApiData;
  const apiMock = mockApi(data); // create the mock API handler per test
  const keycloakMock = mockKeycloak(data); // create the mock Keycloak handler per test
  return context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    let response: MockResponse | undefined = undefined;
    switch (url.hostname) {
      case platformURL.hostname: {
        if (!url.pathname.startsWith('/api/')) return route.continue();
        response = apiMock({
          url,
          method: route.request().method(),
          body: route.request().postDataJSON() as object,
        });
        break;
      }
      case 'legacy_hub': {
        response = keycloakMock({
          url,
          method: route.request().method(),
          body: route.request().postDataJSON() as object,
        });
        break;
      }
    }
    if (!response) {
      response = { status: 404 };
    }
    if (response.body) {
      return route.fulfill({
        status: response.status || 200,
        contentType: 'application/json',
        body: JSON.stringify(response.body),
        headers: response.headers,
      });
    } else {
      return route.fulfill({ status: response.status || 404, headers: response.headers });
    }
  });
}

interface MockResponse {
  status?: number;
  body?: object;
  headers?: Record<string, string>;
}

type MockApiHandler = (options: { url: URL; method: string; body?: object }) => MockResponse;

export function mockApi(data: IApiData): MockApiHandler {
  return ({ url, method, body }) => {
    let response: MockResponse | undefined;

    switch (url.pathname) {
      case '/api/': {
        response = {
          status: 200,
          body: {
            apis: {
              gateway: '/api/gateway/',
              controller: '/api/controller/',
              eda: '/api/eda/',
              galaxy: '/api/galaxy/',
            },
          },
        };
        break;
      }

      case '/api/gateway/v1/login/': {
        switch (method) {
          case 'POST': {
            const user = {
              id: 1,
              username: 'mock',
              is_superuser: true,
              summary_fields: { resource: { ansible_id: '1' } },
            };
            data.api.gateway.v1.me = [user];
            data.api.gateway.v1.legacy_auth = {
              id: user.id,
              username: user.username,
              is_authenticated: true,
              needs_rename: false,
              is_migrated: true,
              linked_accounts: [],
            };
            data.api.controller.v2.me = [user];
            response = { status: 200, body: user };
            break;
          }
        }
        break;
      }

      case '/api/gateway/v1/ui_auth/':
      case '/api/galaxy/_ui/v1/settings/':
      case '/api/gateway/v1/legacy_auth/':
        // always available even if not logged in
        break;
      case '/api/gateway/v1/legacy_auth/finalize/': {
        const user = {
          id: 1,
          username: 'mock',
          is_superuser: true,
          summary_fields: { resource: { ansible_id: '1' } },
        };
        data.api.gateway.v1.me = [user];
        data.api.gateway.v1.legacy_auth = {
          id: user.id,
          username: user.username,
          is_authenticated: true,
          needs_rename: false,
          is_migrated: true,
          linked_accounts: [],
        };
        data.api.controller.v2.me = [user];
        data.api.gateway.v1.legacy_auth = {
          id: 84,
          username: 'mock',
          is_authenticated: false,
          needs_rename: false,
          is_migrated: true,
          linked_accounts: [
            {
              service: 3,
              service_type: 'hub',
              original_username: 'mock',
              user: 84,
              gateway_username: 'mock',
              ansible_id: '22850eee-122f-4a4b-a551-e8b649674669',
              backend_classification: null,
            },
          ],
          needs_aap_password: false,
          allow_rename: true,
          allow_aap_password: false,
          is_sso_account: true,
        };
        response = { status: 200, body: {} };
        break;
      }
      case '/api/gateway/v1/legacy_auth/controller_password/': {
        response = {
          status: 200,
          body: {
            id: 84,
            username: 'mock',
            is_authenticated: false,
            needs_rename: false,
            is_migrated: true,
            linked_accounts: [
              {
                service: 3,
                service_type: 'hub',
                original_username: 'mock',
                user: 84,
                gateway_username: 'mock',
                ansible_id: '22850eee-122f-4a4b-a551-e8b649674669',
                backend_classification: null,
              },
              {
                service: 1,
                service_type: 'controller',
                original_username: 'controller_user',
                user: 55,
                gateway_username: 'controller_user',
                ansible_id: '22850eee-122f-4a4b-a551-e8b64967455',
                backend_classification: null,
              },
            ],
            needs_aap_password: false,
            allow_rename: true,
            allow_aap_password: false,
            is_sso_account: true,
          },
        };
        break;
      }
      default: {
        // otherwise return 401 if not logged in
        const me = data.api.gateway.v1.me;
        if (!Array.isArray(me) || !me.length) {
          response = { status: 401, body: {} };
        }
        break;
      }
    }

    switch (url.pathname) {
      case '/api/controller/v2/projects/': {
        switch (method) {
          case 'POST': {
            response = postMock(url, body!, data);
            const project = response!.body as Project;
            project.status = 'successful';
          }
        }
        break;
      }
    }

    if (!response) {
      // if we have not already intercepted the request,
      // try to generate a default response
      switch (method) {
        default: {
          switch (method) {
            case 'OPTIONS':
              response = optionsMock(url);
              break;
            case 'GET':
              response = getMock(url, data);
              break;
            case 'POST':
              if (body) {
                response = postMock(url, body, data);
              }
              break;
            case 'PUT':
              if (body) {
                response = putMock(url, body, data);
              }
              break;
            case 'DELETE':
              response = deleteMock(url, data);
              break;
          }
        }
      }
    }

    if (!response) {
      response = { status: 501 }; // Not Implemented
    }

    logResponse(method, url, response);

    if (!response) {
      response = { status: 501 }; // Not Implemented
    }

    return response;
  };
}

export function mockKeycloak(data: IApiData): MockApiHandler {
  return ({ url, method: _method, body: _body }) => {
    let response: MockResponse | undefined;
    switch (url.pathname) {
      case '/login/keycloak/': {
        data.api.gateway.v1.legacy_auth = {
          id: 84,
          username: 'hub_keycloak_ui_user_2',
          is_authenticated: false,
          needs_rename: false,
          is_migrated: false,
          linked_accounts: [
            {
              service: 3,
              service_type: 'hub',
              original_username: 'hub_keycloak_ui_user_2',
              user: 84,
              gateway_username: 'hub_keycloak_ui_user_2',
              ansible_id: '22850eee-122f-4a4b-a551-e8b649674669',
              backend_classification: null,
            },
          ],
          needs_aap_password: false,
          allow_rename: true,
          allow_aap_password: false,
          is_sso_account: true,
        };
        response = {
          status: 301,
          headers: { Location: platformUI },
        };
        break;
      }

      default:
        break;
    }

    if (!response) {
      response = { status: 501 }; // Not Implemented
    }

    return response;
  };
}

function getDotPath(path: string): string {
  let dotPath = path.split('/').join('.');
  if (dotPath.startsWith('.')) dotPath = dotPath.slice(1);
  if (dotPath.endsWith('.')) dotPath = dotPath.slice(0, -1);
  return dotPath;
}

function getMock(url: URL, mockData: IApiData): MockResponse | undefined {
  const dotPath = getDotPath(url.pathname);
  const value = getValue(mockData, dotPath) as unknown;
  switch (typeof value) {
    case 'object':
      if (value === null) return undefined;
      if (Array.isArray(value)) {
        return { status: 200, body: { count: value.length, results: value } };
      }
      return { status: 200, body: value };
    case 'undefined': {
      const collectionPath = dotPath.split('.').slice(0, -1).join('.');
      const collection = getValue(mockData, collectionPath) as unknown[];
      if (Array.isArray(collection)) {
        const id = parseInt(dotPath.split('.').slice(-1)[0]);
        const item = collection.find((item) => {
          if (typeof item !== 'object') return false;
          if (item === null) return false;
          if (!('id' in item)) return false;
          return item.id === id;
        });
        if (item) {
          return { status: 200, body: item };
        }
      }
      break;
    }
  }
}

function postMock(url: URL, body: object, mockData: IApiData): MockResponse | undefined {
  const dotPath = getDotPath(url.pathname);
  const value = getValue(mockData, dotPath) as unknown;
  if (!body) return undefined;
  if (Array.isArray(value)) {
    value.push(body);
    if (!('id' in body)) {
      (body as { id: number }).id = value.length;
      (
        body as {
          summary_fields: {
            labels: { results: { id: number }[] };
            resource: { ansible_id: string };
            user_capabilities: {
              edit: boolean;
              delete: boolean;
              start: boolean;
              schedule: boolean;
              copy: boolean;
            };
          };
        }
      ).summary_fields = {
        labels: { results: [] },
        resource: {
          ansible_id: '1234',
        },
        user_capabilities: {
          edit: true,
          delete: true,
          start: true,
          schedule: true,
          copy: true,
        },
      };
    }
    return { status: 201, body };
  }
}

function putMock(url: URL, body: object, mockData: IApiData): MockResponse | undefined {
  const dotPath = getDotPath(url.pathname);
  const value = getValue(mockData, dotPath) as unknown;
  if (!body) return undefined;
  if (Array.isArray(value)) {
    const id = parseInt(dotPath.split('.').slice(-1)[0]);
    const index = value.findIndex((item) => {
      if (typeof item !== 'object') return false;
      if (item === null) return false;
      if (!('id' in item)) return false;
      return (
        (
          item as {
            id: number;
          }
        ).id === id
      );
    });
    if (index !== -1) {
      value[index] = body;
      return { status: 200, body };
    }
  }
}

function deleteMock(url: URL, mockData: IApiData): MockResponse | undefined {
  const dotPath = getDotPath(url.pathname);
  const collectionPath = dotPath.split('.').slice(0, -1).join('.');
  const collection = getValue(mockData, collectionPath) as unknown[];
  if (Array.isArray(collection)) {
    const id = parseInt(dotPath.split('.').slice(-1)[0]);
    const index = collection.findIndex((item) => {
      if (typeof item !== 'object') return false;
      if (item === null) return false;
      if (!('id' in item)) return false;
      return item.id === id;
    });
    if (index !== -1) {
      collection.splice(index, 1);
      return { status: 204 };
    }
  }
}

function optionsMock(url: URL): MockResponse | undefined {
  const dotPath = getDotPath(url.pathname);
  const value = getValue(mockOptions, dotPath) as unknown;
  if (value) {
    return { status: 200, body: value };
  }
  return { status: 200, body: { actions: { POST: {}, PUT: {}, DELETE: {} } } };
}

function logResponse(method: string, url: URL, response: MockResponse) {
  let status = chalk.redBright('500');
  if (response.status !== undefined) {
    if (response.status < 300) {
      status = chalk.greenBright(response.status.toString());
    } else if (response.status < 500) {
      status = chalk.yellow(response.status.toString());
    } else {
      status = chalk.redBright(response.status.toString());
    }
  }

  let chalkMethod = chalk.yellow(method.padStart(7));
  switch (method) {
    case 'GET':
      chalkMethod = chalk.green(method.padStart(7));
      break;
    case 'OPTIONS':
      chalkMethod = chalk.blue(method).padStart(7);
      break;
  }

  if (!process.env.CI) {
    // eslint-disable-next-line no-console
    console.log(chalkMethod, chalk.cyan(url.pathname), status, httpStatus[response.status || 500]);
  }
}

// http status message
const httpStatus: Record<number, string> = {
  200: chalk.greenBright('OK'),
  201: chalk.greenBright('Created'),
  204: chalk.greenBright('No Content'),
  302: chalk.greenBright('Found'),
  401: chalk.yellow('Unauthorized'),
  404: chalk.yellow('Not Found'),
  500: chalk.redBright('Internal Server Error'),
  501: chalk.redBright('Not Implemented'),
};
