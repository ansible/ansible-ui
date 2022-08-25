import { Http2Server } from 'http2'
import { logger } from './logger'
import { requestHandler } from './request-handler'
import { startServer, stopServer } from './server'

export function start(): Promise<Http2Server | undefined> {
    return startServer({ requestHandler })
}

export async function stop(): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
            logger.warn('process stop timeout. exiting...')
            process.exit(1)
        }, 0.5 * 1000).unref()
    }
    await stopServer()
}
