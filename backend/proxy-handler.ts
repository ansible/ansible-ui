/* Copyright Contributors to the Open Cluster Management project */
import cookie from 'cookie'
import { Http2ServerRequest, Http2ServerResponse, OutgoingHttpHeaders } from 'http2'
import { request, RequestOptions } from 'https'
import { pipeline } from 'stream'
import {
    HTTP2_HEADER_CONNECTION,
    HTTP2_HEADER_COOKIE,
    HTTP2_HEADER_HOST,
    HTTP2_HEADER_KEEP_ALIVE,
    HTTP2_HEADER_PROXY_AUTHENTICATE,
    HTTP2_HEADER_PROXY_AUTHORIZATION,
    HTTP2_HEADER_REFERER,
    HTTP2_HEADER_TE,
    HTTP2_HEADER_TRANSFER_ENCODING,
    HTTP2_HEADER_UPGRADE,
    HTTP_STATUS_BAD_GATEWAY,
    HTTP_STATUS_NOT_FOUND,
    HTTP_STATUS_SERVICE_UNAVAILABLE,
    HTTP_STATUS_UNAUTHORIZED,
} from './constants'
import { logger } from './logger'

export function proxyHandler(req: Http2ServerRequest, res: Http2ServerResponse): void {
    const target = req.headers['x-server']
    if (!target || typeof target !== 'string') {
        res.writeHead(HTTP_STATUS_UNAUTHORIZED).end()
        return
    }

    const url = req.url

    const headers: OutgoingHttpHeaders = {}

    const cookieHeader = req.headers[HTTP2_HEADER_COOKIE]
    if (typeof cookieHeader === 'string') {
        const cookies = cookie.parse(cookieHeader)
        if (cookies['csrftoken']) {
            headers['X-CSRFToken'] = cookies['csrftoken']
        }
    }

    for (const header in req.headers) {
        if (header.startsWith(':')) continue
        headers[header] = req.headers[header]
    }

    const proxyUrl = new URL(target)

    if (proxyUrl.hostname !== 'localhost') {
        headers[HTTP2_HEADER_HOST] = proxyUrl.hostname
        headers['origin'] = proxyUrl.toString()
        headers[HTTP2_HEADER_REFERER] = proxyUrl.toString()
    }

    const requestOptions: RequestOptions = {
        protocol: proxyUrl.protocol,
        host: proxyUrl.host,
        hostname: proxyUrl.hostname,
        port: proxyUrl.port,
        method: req.method,
        path: url,
        headers,
        rejectUnauthorized: false,
    }

    pipeline(
        req,
        request(requestOptions, (response) => {
            if (!response) {
                res.writeHead(HTTP_STATUS_NOT_FOUND).end()
                return
            }
            // Remove hop-by-hop headers
            const {
                [HTTP2_HEADER_CONNECTION]: _connection,
                [HTTP2_HEADER_KEEP_ALIVE]: _keepAlive,
                [HTTP2_HEADER_PROXY_AUTHENTICATE]: _proxyAuthenticate,
                [HTTP2_HEADER_PROXY_AUTHORIZATION]: _proxyAuthorization,
                [HTTP2_HEADER_TE]: _te,
                [HTTP2_HEADER_TRANSFER_ENCODING]: _transferEncoding,
                [HTTP2_HEADER_UPGRADE]: _upgrade,
                trailer: _trailer,
                ...responseHeaders
            } = response.headers

            const statusCode = response.statusCode ?? 500
            res.writeHead(statusCode, responseHeaders)
            pipeline(response, res as unknown as NodeJS.WritableStream, (err) => handlePipelineError(err, res))
        }),
        (err) => handleRequestError(err, res)
    )
}

function handleRequestError(err: NodeJS.ErrnoException | null, res: Http2ServerResponse) {
    if (err) {
        switch (err.code) {
            case 'ECONNREFUSED':
                res.writeHead(HTTP_STATUS_SERVICE_UNAVAILABLE).end()
                break
            default:
                logger.error(err)
                res.writeHead(HTTP_STATUS_SERVICE_UNAVAILABLE).end()
                break
        }
    }
}

function handlePipelineError(err: NodeJS.ErrnoException | null, res: Http2ServerResponse) {
    if (err) {
        switch (err.code) {
            default:
                logger.error(err)
                res.writeHead(HTTP_STATUS_BAD_GATEWAY).end()
                break
        }
    }
}
