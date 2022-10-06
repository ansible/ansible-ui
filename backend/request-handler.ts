import { Http2ServerRequest, Http2ServerResponse } from 'http2'
import { HTTP_STATUS_INTERNAL_SERVER_ERROR } from './constants'
import { logger } from './logger'
import { proxyHandler } from './proxy-handler'
import { serve } from './serve'

export function requestHandler(req: Http2ServerRequest, res: Http2ServerResponse): void {
    try {
        if (req.url.startsWith('/api')) {
            proxyHandler(req, res)
        } else {
            void serve(req, res)
        }
    } catch (err) {
        logger.error(err)
        if (!res.headersSent) {
            res.writeHead(HTTP_STATUS_INTERNAL_SERVER_ERROR).end()
            return
        }
    }
}
