/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-misused-promises */
import http from 'http';
import { createMock } from '../create-mock';
import { MockRequest } from '../mock-router';

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
    };

    if (req.headers['content-type'] === 'application/json') {
      request.body = await new Promise((resolve) => {
        let body = '';
        req.on('data', (chunk) => {
          if (chunk instanceof Buffer) {
            body += chunk.toString();
          }
        });
        req.on('end', () => {
          try {
            resolve(JSON.parse(body) as Record<string, unknown>);
          } catch (e) {
            resolve(undefined);
          }
        });
      });
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
  })
  .listen(5050, () => {
    process.on('SIGINT', () => {
      process.exit();
    });

    console.log('Server running on http://localhost:5050');
  });
