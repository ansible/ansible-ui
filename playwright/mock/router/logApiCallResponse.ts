/* eslint-disable no-console */
import { Response } from '@playwright/test';
import chalk from 'chalk';
import { STATUS_CODES } from 'http';
import { platformURL } from '../../commands/login';

export async function logApiCallResponse(response: Response) {
  const url = new URL(response.url());
  if (url.hostname === platformURL.hostname && !url.pathname.startsWith('/api')) return;
  const dim = url.hostname !== platformURL.hostname;

  const request = response.request();
  const method = request.method();
  const status = response.status();

  let statusText = chalk.redBright('500');
  if (status !== undefined) {
    if (status < 300) {
      statusText = chalk.greenBright(status.toString() + ' ' + STATUS_CODES[status]);
    } else if (status < 500) {
      switch (status) {
        case 401:
          statusText = chalk.dim.yellow(status.toString() + ' ' + STATUS_CODES[status]);
          break;
        default:
          statusText = chalk.yellow(status.toString() + ' ' + STATUS_CODES[status]);
          break;
      }
    } else {
      switch (status) {
        case 501:
          statusText = chalk.red(status.toString() + ' ' + STATUS_CODES[status]);
          break;
        default:
          statusText = chalk.redBright(status.toString() + ' ' + STATUS_CODES[status]);
          break;
      }
    }
  }

  let chalkMethod = '';
  switch (method) {
    case 'GET':
      chalkMethod = chalk.green(method);
      break;
    case 'OPTIONS':
      chalkMethod = chalk.blue(method);
      break;
    case 'DELETE':
      chalkMethod = chalk.red(method);
      break;
    case 'POST':
    case 'PUT':
      chalkMethod = chalk.yellow(method);
      break;
  }

  if (!process.env.CI) {
    const logBody = process.env.LOG_API_BODY === 'true';
    if (logBody) {
      if (url.searchParams.toString()) {
        console.log(url.searchParams.toString());
      }

      if (response.headers()['content-type'] === 'application/json') {
        const body = await response.body();
        console.log(
          chalkMethod,
          dim ? chalk.dim.cyan(url.pathname) : chalk.cyan(url.pathname),
          statusText,
          JSON.parse(body.toString())
        );
      }
    } else {
      console.log(
        chalkMethod,
        dim ? chalk.dim.cyan(url.pathname) : chalk.cyan(url.pathname),
        statusText
      );
    }
  }
}
