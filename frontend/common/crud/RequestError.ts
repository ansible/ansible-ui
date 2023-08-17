export async function createRequestError(response: Response) {
  let body: string | object | undefined;
  if (response.headers.get('content-type')?.includes('application/json')) {
    try {
      body = (await response.json()) as object;
    } catch {
      // Do nothing
    }
  } else if (response.headers.get('content-type')?.includes('text/plain')) {
    try {
      body = await response.text();
    } catch {
      // Do nothing
    }
  }
  new RequestError(response.statusText, response.status, body);
}

export class RequestError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body: string | object | undefined
  ) {
    super(message);
    Object.setPrototypeOf(this, RequestError.prototype);
    this.name = 'RequestError';
  }
}
