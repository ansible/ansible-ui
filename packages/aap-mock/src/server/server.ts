/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-misused-promises */
import http from 'http';
import { createMock } from '../create-mock';
import { MockRequest } from '../mock-router';
import { logResponse } from './log-response';

const { router, context } = createMock();

http
  .createServer(async function (req, res) {
    if (!req.url || !req.method) {
      res.writeHead(404);
      res.end();
      return;
    }

    const request: MockRequest = {
      method: req.method,
      url: new URL('http:///localhost:5050' + req.url),
      headers: req.headers as Record<string, string>,
      context,
      params: {},
    };

    if (req.headers['content-type']) {
      const bodyText = await new Promise<string>((resolve) => {
        let body = '';
        req.on('data', (chunk) => {
          if (chunk instanceof Buffer) {
            body += chunk.toString();
          }
        });
        req.on('end', () => {
          resolve(body);
        });
      });

      if (bodyText) {
        switch (req.headers['content-type'].split(';')[0]) {
          case 'application/json':
            try {
              request.body = JSON.parse(bodyText) as Record<string, unknown>;
            } catch (e) {
              // Ignore JSON parse error
            }
            break;
          case 'application/x-www-form-urlencoded':
            request.body = Object.fromEntries(new URLSearchParams(bodyText));
            break;
          default:
            break;
        }
      }
    }

    const response = router.handle(request);

    const headers = response.headers ?? {};
    if (response.body) {
      headers['Content-Type'] = 'application/json';
    }
    res.writeHead(response.status ?? 501, headers);
    if (response.body) {
      res.write(JSON.stringify(response.body));
    }
    res.end();

    logResponse(request, response);
  })
  .listen(5050, () => {
    process.on('SIGINT', () => {
      process.exit();
    });

    console.log('Server running on http://localhost:5050');
  });
