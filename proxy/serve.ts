/* Copyright Contributors to the Open Cluster Management project */
import etag from 'etag'
import { createReadStream, Stats } from 'fs'
import { stat } from 'fs/promises'
import { constants, Http2ServerRequest, Http2ServerResponse } from 'http2'
import { extname } from 'path'
import { pipeline } from 'stream'
import { logger } from './logger'

const cacheControl =
  process.env.NODE_ENV === 'production' ? 'public, max-age=31536000, stale-if-error=60' : 'no-store'
const localesCacheControl =
  process.env.NODE_ENV === 'production' ? 'public, max-age=3600, stale-if-error=60' : 'no-store'

export async function serve(req: Http2ServerRequest, res: Http2ServerResponse): Promise<void> {
  try {
    let url = req.url.split('?')[0]

    let ext = extname(url)
    if (ext === '') {
      ext = '.html'
      url = '/index.html'
    }

    // Security headers
    if (url === '/index.html') {
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Strict-Transport-Security', 'max-age=31536000')
      res.setHeader('X-Frame-Options', 'deny')
      res.setHeader('X-XSS-Protection', '1; mode=block')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
      res.setHeader('Referrer-Policy', 'no-referrer')
      res.setHeader('X-DNS-Prefetch-Control', 'off')
      res.setHeader('Expect-CT', 'enforce, max-age=30')
      // res.setHeader('Content-Security-Policy', ["default-src 'self'"].join(';'))
    } else if (url === '/manifest.webmanifest') {
      res.setHeader('Cache-Control', 'public, no-cache')
    } else if (url === '/service-worker.js') {
      res.setHeader('Cache-Control', 'public, no-cache')
    } else if (url.includes('/locales/')) {
      res.setHeader('Cache-Control', localesCacheControl)
    } else {
      res.setHeader('Cache-Control', cacheControl)
    }

    const acceptEncoding = (req.headers['accept-encoding'] as string) ?? ''
    const contentType = contentTypes[ext]
    if (contentType === undefined) {
      logger.debug({ msg: 'unknown content type', ext, url: req.url })
      res.writeHead(404).end()
      return
    }

    const filePath = './public' + url
    let stats: Stats
    try {
      stats = await stat(filePath)
    } catch {
      res.writeHead(404).end()
      return
    }

    const modificationTime = stats.mtime.toUTCString()
    res.setHeader(constants.HTTP2_HEADER_LAST_MODIFIED, modificationTime)
    // Don't send content for cache revalidation
    if (req.headers['if-modified-since'] === modificationTime) {
      res.writeHead(constants.HTTP_STATUS_NOT_MODIFIED).end()
    }

    if (/\bbr\b/.test(acceptEncoding)) {
      try {
        const brStats = await stat(filePath + '.br')
        const readStream = createReadStream('./public' + url + '.br', { autoClose: true })
        readStream
          .on('open', () => {
            res.writeHead(200, {
              [constants.HTTP2_HEADER_CONTENT_ENCODING]: 'br',
              [constants.HTTP2_HEADER_CONTENT_TYPE]: contentType,
              [constants.HTTP2_HEADER_CONTENT_LENGTH]: brStats.size.toString(),
              [constants.HTTP2_HEADER_ETAG]: etag(brStats),
            })
          })
          .on('error', (err) => {
            logger.error(err)
            res.writeHead(404).end()
          })
        pipeline(readStream, res as unknown as NodeJS.WritableStream, (err) => {
          if (err) logger.error(err)
        })
        return
      } catch {
        // Do nothing
      }
    }

    if (/\bgzip\b/.test(acceptEncoding)) {
      try {
        const gzStats = await stat(filePath + '.gz')
        const readStream = createReadStream('./public' + url + '.gz', { autoClose: true })
        readStream
          .on('open', () => {
            res.writeHead(200, {
              [constants.HTTP2_HEADER_CONTENT_ENCODING]: 'gzip',
              [constants.HTTP2_HEADER_CONTENT_TYPE]: contentType,
              [constants.HTTP2_HEADER_CONTENT_LENGTH]: gzStats.size.toString(),
              [constants.HTTP2_HEADER_ETAG]: etag(gzStats),
            })
          })
          .on('error', (err) => {
            logger.error(err)
            res.writeHead(404).end()
          })
        pipeline(readStream, res as unknown as NodeJS.WritableStream, (err) => {
          if (err) logger.error(err)
        })
        return
      } catch {
        // Do nothing
      }
    }

    const readStream = createReadStream('./public' + url, { autoClose: true })
    readStream
      .on('open', () => {
        res.writeHead(200, {
          [constants.HTTP2_HEADER_CONTENT_TYPE]: contentType,
          [constants.HTTP2_HEADER_CONTENT_LENGTH]: stats.size.toString(),
          [constants.HTTP2_HEADER_ETAG]: etag(stats),
        })
      })
      .on('error', (err) => {
        logger.error(err)
        res.writeHead(404).end()
      })
    pipeline(readStream, res as unknown as NodeJS.WritableStream, (err) => {
      if (err) logger.error(err)
    })
  } catch (err) {
    logger.error(err)
    res.writeHead(404).end()
    return
  }
}

const contentTypes: Record<string, string> = {
  '.txt': 'text/plain;charset=UTF-8',
  '.html': 'text/html;charset=UTF-8',
  '.css': 'text/css;charset=UTF-8',
  '.js': 'application/javascript;charset=UTF-8',
  '.map': 'application/json;charset=UTF-8',
  '.jpg': 'image/jpeg',
  '.json': 'application/json;charset=UTF-8',
  '.svg': 'image/svg+xml;charset=UTF-8',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json;charset=UTF-8',
}
