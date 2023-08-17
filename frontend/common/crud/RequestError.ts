import { stringify } from 'yaml';

export async function createRequestError(response: Response) {
  let message: string = response.statusText;
  let details: string | undefined = undefined;
  let body: string | object | undefined = undefined;
  let json: object | undefined = undefined;

  if (response.headers.get('content-type')?.includes('application/json')) {
    try {
      body = (await response.json()) as object;
    } catch {
      // Do nothing
    }
  } else if (response.headers.get('content-type')?.includes('text/plain')) {
    try {
      body = await response.text();

      try {
        body = JSON.parse(body) as object;
      } catch {
        // Do nothing
      }
    } catch {
      // Do nothing
    }
  }

  switch (typeof body) {
    case 'object': {
      if (body === null) break;
      json = body;

      // Handle AWX error __all__
      if (
        '__all__' in body &&
        Array.isArray(body.__all__) &&
        body.__all__.length > 0 &&
        typeof body.__all__[0] === 'string'
      ) {
        message = body.__all__[0];
        break;
      }

      const values = Object.values(body);
      if (values.length === 1) {
        if (typeof values[0] === 'string') {
          message = values[0];
          break;
        }

        if (
          Array.isArray(values[0]) &&
          values[0].length === 1 &&
          typeof values[0][0] === 'string'
        ) {
          message = values[0][0];
          break;
        }
      }

      details = stringify(body);
    }
  }

  return new RequestError(message, details, response.status, body, json);
}

export class RequestError extends Error {
  constructor(
    message: string,
    public readonly details: string | undefined,
    public readonly statusCode: number,
    public readonly body: string | object | undefined,
    public readonly json: object | undefined
  ) {
    super(message);
    Object.setPrototypeOf(this, RequestError.prototype);
    this.name = 'RequestError';
  }
}
