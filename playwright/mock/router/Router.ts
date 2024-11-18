import { Route } from '@playwright/test';
import { match, MatchFunction, Path } from 'path-to-regexp';
import { IApiData, mockData } from '../mockData';
import { mockOptions } from '../mockOptions';
import { MockResponse } from './MockResponse';

export type RouteOptions = {
  route: Route;
  url: URL;
  dotPath: string;
  params: Record<string, string | string[]>;
  mockData: IApiData;
  mockOptions: typeof mockOptions;
  requestData: Record<string, unknown> | undefined;
};

export type RouteHandler = (options: RouteOptions) => MockResponse | undefined;

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

  handle(route: Route, data: typeof mockData, options: typeof mockOptions): MockResponse {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const routes = this.routes[method as Methods];
    let dotPath = url.pathname.split('/').join('.');
    if (dotPath.startsWith('.')) dotPath = dotPath.slice(1);
    if (dotPath.endsWith('.')) dotPath = dotPath.slice(0, -1);
    let requestData: Record<string, unknown> | undefined;
    if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && request.postData) {
      try {
        const data = request.postData();
        if (data) {
          requestData = JSON.parse(data) as Record<string, unknown>;
        }
      } catch (e) {
        // console.log(e);
      }
    }
    if (routes) {
      for (const { matchFn, handler } of routes) {
        const matched = matchFn(url.pathname);
        if (matched) {
          const response = handler({
            route,
            url,
            params: matched.params as Record<string, string | string[]>,
            mockData: data,
            mockOptions: options,
            dotPath,
            requestData,
          });
          if (response) {
            return response;
          }
        }
      }
    }

    return { status: 501 };
  }
}
