/* Copyright Contributors to the Open Cluster Management project */
import { cpus, totalmem } from 'os'
import { start, stop } from './backend'
import { logger } from './logger'

logger.info({
  msg: `proxy start`,
  NODE_ENV: process.env.NODE_ENV,
  cpus: `${Object.keys(cpus()).length}`,
  memory: `${(totalmem() / (1024 * 1024 * 1024)).toPrecision(2).toString()}GB`,
  node: process.versions.node,
  version: process.env.VERSION,
})

process.on('exit', function processExit(code) {
  if (code !== 0) {
    logger.error({ msg: `process exit`, code: code })
  } else {
    logger.debug({ msg: `process exit`, code: code })
  }
})

process.on('SIGINT', () => {
  // eslint-disable-next-line no-console
  if (process.env.NODE_ENV === 'development') console.log()
  logger.debug({ msg: 'process SIGINT' })
  void stop()
})

process.on('SIGTERM', () => {
  logger.debug({ msg: 'process SIGTERM' })
  void stop()
})

void start()
