import { match, MatchFunction, Path } from 'path-to-regexp';
import { MockContext } from './context/context';

export interface MockRequest {
  method: string;
  url: URL;
  headers: Record<string, string>;
  body?: Record<string, unknown>;
  context: MockContext;
  params: Partial<Record<string, string | string[]>>;
}

export interface MockResponse {
  status?: number;
  body?: object;
  headers?: Record<string, string>;
}

export type RouteHandler = (request: MockRequest) => MockResponse | undefined;

type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

export class Router {
  private routes: Record<
    Methods,
    {
      matchFn: MatchFunction<Partial<Record<string, string | string[]>>>;
      handler: RouteHandler;
    }[]
  > = {
    GET: [],
    POST: [],
    PUT: [],
    DELETE: [],
    PATCH: [],
    OPTIONS: [],
  };

  GET(path: Path | Path[], handler: RouteHandler) {
    this.routes.GET.push({ matchFn: match(path), handler });
    return this;
  }

  POST(path: Path | Path[], handler: RouteHandler) {
    this.routes.POST.push({ matchFn: match(path), handler });
    return this;
  }

  PUT(path: Path | Path[], handler: RouteHandler) {
    this.routes.PUT.push({ matchFn: match(path), handler });
    return this;
  }

  DELETE(path: Path | Path[], handler: RouteHandler) {
    this.routes.DELETE.push({ matchFn: match(path), handler });
    return this;
  }

  PATCH(path: Path | Path[], handler: RouteHandler) {
    this.routes.PATCH.push({ matchFn: match(path), handler });
    return this;
  }

  OPTIONS(path: Path | Path[], handler: RouteHandler) {
    this.routes.OPTIONS.push({ matchFn: match(path), handler });
    return this;
  }

  handle(request: MockRequest): MockResponse {
    const routes = this.routes[request.method as Methods];
    if (routes) {
      const url = new URL(request.url);
      for (const { matchFn, handler } of routes) {
        const matched = matchFn(url.pathname);
        if (matched) {
          request.params = matched.params;
          const response = handler(request);
          if (response) {
            return response;
          }
        }
      }
    }

    return { status: 501 };
  }
}
