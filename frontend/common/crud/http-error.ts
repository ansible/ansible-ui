export class HTTPError extends Error {
  constructor(msg: string, public code: number, public responseBody?: object) {
    super(msg);
    Object.setPrototypeOf(this, HTTPError.prototype);
    this.name = 'HTTPError';
  }
}
