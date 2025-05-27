import { MockRequest } from '../mock-router';
import { filterItems, sortItems, paginateItems } from '../handlers/getItems';

type Map = Record<string, unknown>;

/* Get sub-resource mappings (authenticators/:id/authenticator_maps) */
export function getAuthenticatorMaps(request: MockRequest) {
  const authenticatorId = request.params.id;
  const allMaps = request.context.data.api.gateway.v1.authenticator_maps as Map[];
  let results = allMaps.filter(
    // eslint-disable-next-line eqeqeq
    (map) => (map as { authenticator?: string })?.authenticator == authenticatorId
  );
  const count = results.length;

  results = filterItems(results, request.url.searchParams) as Map[];
  results = sortItems(results, request.url.searchParams) as Map[];
  results = paginateItems(results, request.url.searchParams) as Map[];

  return {
    status: 200,
    body: {
      count,
      next: null,
      previous: null,
      results,
    },
  };
}

export function patchAuthenticatorMap(request: MockRequest) {
  const allMaps = request.context.data.api.gateway.v1.authenticator_maps as Map[];
  const map = allMaps.find((map) => Number(map?.id) === Number(request.params.id));
  if (!map) {
    return { status: 404 };
  }
  if (!request.body) {
    return { status: 400 };
  }

  for (const [key, value] of Object.entries(request.body)) {
    map[key] = value;
  }

  return {
    status: 200,
    body: map,
  };
}
