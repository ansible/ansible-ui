import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { HTTP_STATUS_OK } from './constants';

export function readiness(req: Http2ServerRequest, res: Http2ServerResponse) {
  res.writeHead(HTTP_STATUS_OK).end();
}
