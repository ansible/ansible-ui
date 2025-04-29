/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-misused-promises */
import http from 'http';
import pc from 'picocolors';
import { Formatter } from 'picocolors/types';
import { MockRequest, MockResponse } from '../mock-router';

export function logResponse(request: MockRequest, response: MockResponse) {
  const statusCode = response.status ?? 501;
  let status = statusCode.toString() + ' ' + http.STATUS_CODES[statusCode];
  let statusFormatter: Formatter = pc.gray;
  let method = request.method;
  let methodFormatter: Formatter = pc.gray;
  let url = request.url.pathname;
  let urlFormatter: Formatter = pc.blueBright;

  let isDim = false;

  switch (method) {
    case 'GET':
      methodFormatter = pc.green;
      break;
    case 'POST':
    case 'PUT':
    case 'PATCH':
      methodFormatter = pc.yellow;
      break;
    case 'DELETE':
      methodFormatter = pc.red;
      break;
    case 'OPTIONS':
      isDim = true;
      methodFormatter = pc.green;
      break;
  }

  if (statusCode >= 500) {
    statusFormatter = pc.redBright;
  } else if (statusCode >= 400) {
    statusFormatter = pc.red;
  } else if (statusCode >= 300) {
    statusFormatter = pc.yellowBright;
  } else if (statusCode >= 200) {
    statusFormatter = pc.green;
  }

  switch (statusCode) {
    case 401:
      isDim = true;
      // methodFormatter = pc.gray;
      // statusFormatter = pc.gray;
      // urlFormatter = pc.gray;
      break;
    case 404:
      statusFormatter = pc.yellow;
      break;
    case 501:
      isDim = true;
      methodFormatter = pc.red;
      urlFormatter = pc.red;
      break;
  }

  status = statusFormatter(status);
  method = methodFormatter(method);
  url = urlFormatter(url);

  if (request.url.search) {
    let queryString = request.url.search.slice(1);
    queryString = queryString
      .split('&')
      .map((part) => part.split('='))
      .map((keyValues) => {
        if (keyValues.length === 1) return keyValues[0];
        const [key, value] = keyValues;
        return `${pc.cyanBright(key)}${pc.dim(pc.white('='))}${pc.white(value)}`;
      })
      .join(pc.dim(pc.gray('&')));

    // pc.dim(pc.gray('?') + request.url.search.split('&').join(pc.dim('&')));
    url += pc.dim(pc.gray('?')) + queryString;
  }

  if (isDim) {
    console.log(pc.dim(`${method} ${url} ${status}`));
  } else {
    console.log(`${method} ${url} ${status}`);
  }
}
