import { Organization } from '../../frontend/controller/interfaces/Organization';

export function mockController() {
  cy.intercept('GET', '/api/login/', { statusCode: 200 });
  cy.intercept('POST', '/api/login/', { statusCode: 200 });
  cy.fixture('me.json').then((json: string) => cy.intercept('GET', '/api/v2/me/', json));

  cy.requestPost<Organization>('/api/v2/organizations/', { name: 'Default' });

  cy.intercept('GET', `/api/v2/**`, (req) => {
    const result = handleControllerGet(req.url);
    req.reply(result ? 200 : 404, result);
  });

  cy.intercept('POST', `/api/v2/**`, (req) => {
    const result = handleControllerPost(req.url, req.body as ICollectionMockItem);
    req.reply(201, result);
  });

  cy.intercept('PATCH', `/api/v2/**`, (req) => {
    const result = handleControllerPatch(req.url, req.body as ICollectionMockItem);
    req.reply(result ? 200 : 404);
  });

  cy.intercept('DELETE', `/api/v2/**`, (req) => {
    const result = handleControllerDelete(req.url);
    req.reply(result ? 200 : 404);
  });
}

export function handleControllerRequest(method: string, url: string, body: ICollectionMockItem) {
  switch (method) {
    case 'GET':
      return handleControllerGet(url);
    case 'POST':
      return handleControllerPost(url, body);
    case 'PATCH':
      return handleControllerPatch(url, body);
    case 'DELETE':
      return handleControllerDelete(url);
  }
}

// function getQueryString(url: string) {
//   let queryString: string | undefined;
//   if (url.includes('?')) {
//     queryString = url.substring(url.indexOf('?'));
//   }
//   return queryString;
// }

function sanitizeUrl(url: string) {
  if (url.includes('?')) {
    url = url.substring(0, url.indexOf('?'));
  }
  if (url.includes('/api/v2')) {
    url = url.substring(url.indexOf('/api/v2/') + 8);
  }
  return url;
}

export function handleControllerGet(url: string) {
  url = sanitizeUrl(url);
  const parts = url.split('/');
  const collectionName = parts[0];
  const collection = getMockCollection(collectionName);
  const itemID = parts.length > 1 && parts[1] && Number(parts[1]);
  if (itemID) {
    const itemIndex = collection.findIndex((item) => item.id === itemID);
    if (itemIndex === -1) return undefined;
    const item = collection[itemIndex];
    return { ...item };
  } else {
    return { count: collection.length, results: [...collection] };
  }
}

let id = 1;
export function handleControllerPost(url: string, body: ICollectionMockItem) {
  url = sanitizeUrl(url);
  const parts = url.split('/');
  const collectionName = parts[0];
  const collection = getMockCollection(collectionName);
  while (collection.find((item) => item.id == id)) id++;
  body.id = id;
  if (body.organization !== undefined && body.organization !== undefined) {
    const organizationID = body.organization;
    const organizations = getMockCollection('organizations');
    body.summary_fields = {
      organization: {
        id: organizationID,
        name: (organizations.find((o) => o.id === organizationID) as Organization).name,
      },
    };
  }
  body.created = new Date(Date.now()).toISOString();
  body.modified = new Date(Date.now()).toISOString();
  collection.push(body);
  return body;
}

export function handleControllerPatch(url: string, body: ICollectionMockItem) {
  url = sanitizeUrl(url);
  const parts = url.split('/');
  const collectionName = parts[0];
  const collection = getMockCollection(collectionName);
  const itemID = parts.length > 1 && Number(parts[1]);
  if (itemID) {
    const itemIndex = collection.findIndex((item) => item.id === itemID);
    if (itemIndex === -1) return false;
    const item = collection[itemIndex];
    Object.assign(item, body);
    item.modified = new Date(Date.now()).toISOString();
    return true;
  }
  return false;
}

export function handleControllerDelete(url: string) {
  url = sanitizeUrl(url);
  const parts = url.split('/');
  const collectionName = parts[0];
  const collection = getMockCollection(collectionName);
  const itemID = parts.length > 1 && Number(parts[1]);
  if (itemID) {
    const itemIndex = collection.findIndex((item) => item.id === itemID);
    if (itemIndex === -1) return false;
    collection.splice(itemIndex, 1);
    return true;
  } else {
    collection.splice(0, collection.length);
    return true;
  }
}

export interface ICollectionMockItem {
  id: number;
  organization?: number;
  created?: string;
  modified?: string;
  summary_fields?: {
    organization?: {
      id: number;
      name: string;
    };
  };
}

const collections: { [collectionName: string]: ICollectionMockItem[] } = {};

function getMockCollection(collectionName: string): ICollectionMockItem[] {
  let collection = collections[collectionName];
  if (!collection) {
    collection = [];
    collections[collectionName] = collection;
  }
  return collection;
}
