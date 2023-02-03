import cookie from 'cookie';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { HTTP2_HEADER_COOKIE, HTTP_STATUS_INTERNAL_SERVER_ERROR } from './constants';
import { logger } from './logger';
import { proxyHandler } from './proxy-handler';
import { serve } from './serve';

export function requestHandler(req: Http2ServerRequest, res: Http2ServerResponse): void {
  try {
    let proxyRequest = false;
    if (req.url.startsWith('/api/') || req.url.startsWith('/eda/api/')) {
      const cookieHeader = req.headers[HTTP2_HEADER_COOKIE];
      let cookies: Record<string, string> | undefined;
      if (typeof cookieHeader === 'string') {
        cookies = cookie.parse(cookieHeader);
      }

      const target = cookies?.['server'];
      console.log('Debug : target', target);
      proxyRequest = !!target;
      console.log('Debug : proxyRequest', proxyRequest);
    }

    if (proxyRequest) {
      proxyHandler(req, res);
    } else {
      void serve(req, res);
    }
  } catch (err) {
    logger.error(err);
    if (!res.headersSent) {
      res.writeHead(HTTP_STATUS_INTERNAL_SERVER_ERROR).end();
      return;
    }
  }
}
