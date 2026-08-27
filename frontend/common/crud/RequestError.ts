import jsyaml from 'js-yaml';

const HTTP_STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  408: 'Request Timeout',
  409: 'Conflict',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

export async function createRequestError(response: Response) {
  let details: string | undefined = undefined;
  let body: string | object | undefined = undefined;
  let json: object | undefined = undefined;

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    body = await parseJSON(response);
  } else if (contentType?.includes('text/plain')) {
    body = await parseText(response);
  }

  if (typeof body === 'object' && body !== null) {
    json = body;
    details = jsyaml.dump(body);
  }

  // response.statusText is always empty under HTTP/2, so fall back to the
  // standard reason phrase for the status code.
  const message: string =
    response.statusText || HTTP_STATUS_TEXT[response.status] || `Error ${response.status}`;

  return new RequestError(message, details, response.status, body, json);
}

async function parseText(response: Response): Promise<string | object | undefined> {
  try {
    const text = await response.text();
    return tryParseJSON(text) ?? text;
  } catch {
    return undefined;
  }
}

async function parseJSON(response: Response) {
  try {
    return (await response.json()) as object;
  } catch {
    return undefined;
  }
}

function tryParseJSON(value: string): Record<string, unknown> | undefined {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

export class RequestError extends Error {
  public readonly details: string | undefined;
  public readonly statusCode: number;
  public readonly body: string | object | undefined;
  public readonly json: object | undefined;

  constructor(
    message: string,
    details: string | undefined,
    statusCode: number,
    body: string | object | undefined,
    json: object | undefined
  ) {
    super(message);
    Object.setPrototypeOf(this, RequestError.prototype);
    this.name = 'RequestError';
    this.details = details;
    this.statusCode = statusCode;
    this.body = body;
    this.json = json;
  }
}

export function isRequestError(error: unknown): error is RequestError {
  return error instanceof RequestError;
}
