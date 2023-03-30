export class HTTPError extends Error {
  constructor(msg: string, public code: number, public description?: string) {
    super(msg);
    Object.setPrototypeOf(this, HTTPError.prototype);
    this.name = 'HTTPError';

    if (typeof description === 'string') {
      try {
        const json = JSON.parse(description) as object;
        if (
          typeof json === 'object' &&
          json !== null &&
          '__all__' in json &&
          Array.isArray(json.__all__) &&
          json.__all__.length > 0 &&
          typeof json.__all__[0] === 'string'
        ) {
          this.message = json.__all__[0];
          this.description = undefined;
        }
      } catch {
        // Do Nothing
      }
    }
  }
}
