/* Copyright Contributors to the Open Cluster Management project */
/* istanbul ignore file */
import { readFileSync } from 'fs';
import { STATUS_CODES } from 'http';
import {
  constants,
  createSecureServer,
  createServer,
  Http2Server,
  Http2ServerRequest,
  Http2ServerResponse,
} from 'http2';
import { Socket } from 'net';
import { join } from 'path';
import { exit } from 'process';
import selfsigned from 'selfsigned';
import { TLSSocket } from 'tls';
import { WebSocket, WebSocketServer } from 'ws';
import { HTTP2_HEADER_CONTENT_LENGTH } from './constants';
import { logger } from './logger';

let server: Http2Server | undefined;

interface ISocketRequests {
  socketID: number;
  activeRequests: number;
}

let nextSocketID = 0;
const sockets: { [id: string]: Socket | TLSSocket | undefined } = {};

export type ServerOptions = {
  requestHandler:
    | ((req: Http2ServerRequest, res: Http2ServerResponse) => void)
    | ((req: Http2ServerRequest, res: Http2ServerResponse) => Promise<unknown>);
  logRequest?: (req: Http2ServerRequest, res: Http2ServerResponse) => void;
};

export function startServer(options: ServerOptions): Promise<Http2Server | undefined> {
  let cert: Buffer | undefined;
  let key: Buffer | undefined;
  try {
    cert = readFileSync('./certs/tls.crt');
    key = readFileSync('./certs/tls.key');
  } catch (err) {
    const pems = selfsigned.generate(undefined, {
      keySize: 2048,
    });
    cert = Buffer.from(pems.cert);
    key = Buffer.from(pems.private);
    logger.info({ msg: 'using self signed certificates' });
  }

  try {
    if (cert && key) {
      logger.debug({ msg: `server start`, secure: true });
      server = createSecureServer(
        { cert, key, allowHTTP1: true },
        options.requestHandler as (req: Http2ServerRequest, res: Http2ServerResponse) => void
      );
    } else {
      logger.debug({ msg: `server start`, secure: false });
      server = createServer(
        options.requestHandler as (req: Http2ServerRequest, res: Http2ServerResponse) => void
      );
    }

    const wss = new WebSocketServer({ server: server as unknown as undefined });
    wss.on('listening', () => logger.info('websocket server listening'));
    wss.on('connection', (ws, incommingMessage) => {
      const cookies = incommingMessage.headers.cookie
        ?.split(';')
        .map((p) => p.trim())
        .reduce<Record<string, string>>((cookies, cookieValue) => {
          const parts = cookieValue.split('=');
          if (parts.length > 0) {
            cookies[parts[0]] = parts.slice(1).join('=');
          }
          return cookies;
        }, {});
      const server = cookies?.server;
      logger.debug({ msg: 'websocket conection', targetServer: server });

      let messageQueue: string[] | undefined = [];

      let websocket: WebSocket | undefined;
      if (server) {
        let new_uri: string;
        if (server.startsWith('https')) {
          new_uri = server.replace('https', 'wss');
        } else {
          new_uri = server.replace('http', 'ws');
        }
        new_uri = join(new_uri, `/websocket/`);
        websocket = new WebSocket(new_uri, {
          headers: incommingMessage.headers,
          rejectUnauthorized: false,
        });
      }

      websocket
        ?.on('error', (err) => {
          logger.error({ msg: 'websocket proxy error', error: err.message });
        })
        .on('open', () => {
          logger.debug({ msg: 'websocket proxy open' });
          if (messageQueue) {
            for (const message of messageQueue) {
              websocket?.send(message);
            }
            messageQueue = undefined;
          }
        })
        .on('message', (data) => {
          logger.debug({
            msg: 'websocket proxy message',
            ...(JSON.parse(data.toString()) as unknown as object),
          });
          ws.send(data.toString());
        })
        .on('close', () => {
          logger.debug({ msg: 'websocket proxy close' });
        });

      ws.on('error', (err) => logger.error({ msg: 'websocket error', message: err.message }))
        .on('message', (data) => {
          logger.debug({
            msg: 'websocket message',
            ...(JSON.parse(data.toString()) as unknown as object),
          });
          if (messageQueue) {
            messageQueue.push(data.toString());
          } else {
            websocket?.send(data.toString());
          }
        })
        .on('close', () => {
          logger.debug('websocket close');
          websocket?.close();
        });
    });
    wss.on('error', (err) => logger.error({ msg: 'websocket server error', error: err.message }));
    wss.on('close', () => logger.info('websocket server closed'));

    return new Promise((resolve, reject) => {
      server
        ?.listen(process.env.PORT, () => {
          const address = server?.address();
          if (address == null) {
            logger.info({ msg: `server listening` });
          } else if (typeof address === 'string') {
            logger.info({ msg: `server listening`, address });
          } else {
            logger.info({ msg: `server listening`, port: address.port });
          }
          resolve(server);
        })
        .on('connection', (socket: Socket) => {
          let socketID = nextSocketID++;
          while (sockets[socketID] !== undefined) {
            socketID = nextSocketID++;
          }
          sockets[socketID] = socket;
          (socket as unknown as ISocketRequests).socketID = socketID;
          (socket as unknown as ISocketRequests).activeRequests = 0;
          socket.on('close', () => {
            const socketID = (socket as unknown as ISocketRequests).socketID;
            if (socketID < nextSocketID) nextSocketID = socketID;
            sockets[socketID] = undefined;
          });
        })
        .on('request', (req: Http2ServerRequest, res: Http2ServerResponse) => {
          if (isStopping) {
            res.setHeader(constants.HTTP2_HEADER_CONNECTION, 'close');
          }
          const start = process.hrtime();
          const socket = req.socket as unknown as ISocketRequests;
          socket.activeRequests++;
          req.on('close', () => {
            socket.activeRequests--;
            if (isStopping) {
              req.socket.destroy();
            }

            const msg: Record<string, string | number | undefined> = {
              msg: STATUS_CODES[res.statusCode],
              status: res.statusCode,
              method: req.method,
              path: req.url,
            };

            if (process.env.NODE_ENV === 'development') {
              const diff = process.hrtime(start);
              const time = Math.round((diff[0] * 1e9 + diff[1]) / 1000);
              msg.ms = time;
            }

            if (res.hasHeader(HTTP2_HEADER_CONTENT_LENGTH)) {
              try {
                const length = Number(res.getHeader(HTTP2_HEADER_CONTENT_LENGTH));
                if (Number.isInteger(length)) {
                  msg.kb = length / 1000;
                }
              } catch {
                // DO nothing
              }
            }

            if (res.statusCode >= 500) {
              logger.error(msg);
            } else {
              logger.debug(msg);
            }
          });
        })
        .on('error', (err: NodeJS.ErrnoException) => {
          if (err.code === 'EADDRINUSE') {
            logger.error({
              msg: `server error`,
              error: 'address already in use',
              port: Number(process.env.PORT),
            });
            reject(undefined);
          } else {
            logger.error({ msg: `server error`, error: err.message });
          }
          if (server?.listening) server.close();
        });
    });
  } catch (err) {
    if (err instanceof Error) {
      logger.error({ msg: `server start error`, error: err.message, stack: err.stack });
    } else {
      logger.error({ msg: `server start error` });
    }
    void stopServer();
    return Promise.resolve<undefined>(undefined);
  }
}

let isStopping = false;

export async function stopServer(): Promise<void> {
  if (isStopping) return;
  isStopping = true;

  for (const socketID of Object.keys(sockets)) {
    const socket = sockets[socketID];
    if (socket !== undefined) {
      if ((socket as unknown as ISocketRequests).activeRequests === 0) {
        socket.destroy();
      }
    }
  }

  if (server?.listening) {
    logger.debug({ msg: 'closing server' });

    setTimeout(() => {
      logger.error({ msg: 'server did not close after 60 seconds. killing process' });
      exit(1);
    }, 60 * 1000).unref();

    const delay = Number(process.env.CLOSE_DELAY);
    if (Number.isInteger(delay) && delay > 0) {
      logger.info({ msg: `waiting ${delay} seconds before closing the server` });
      await new Promise<void>((resolve) => setTimeout(resolve, delay * 1000));
    }

    await new Promise<void>((resolve) =>
      server?.close((err: Error | undefined) => {
        if (err) {
          logger.error({ msg: 'server close error', name: err.name, error: err.message });
        } else {
          logger.debug({ msg: 'server closed' });
        }
        resolve();
      })
    );
  }
}
