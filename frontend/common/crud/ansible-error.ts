import { stringify } from 'yaml';

export class AnsibleError extends Error {
  constructor(msg: string, public code: number, public description?: string) {
    super(msg);
    Object.setPrototypeOf(this, AnsibleError.prototype);
    this.name = 'HTTPError';

    if (typeof description === 'string') {
      try {
        const json = JSON.parse(description) as object;
        switch (typeof json) {
          case 'object':
            {
              if (json === null) break;

              // Handle AWX error __all__
              if (
                '__all__' in json &&
                Array.isArray(json.__all__) &&
                json.__all__.length > 0 &&
                typeof json.__all__[0] === 'string'
              ) {
                this.message = json.__all__[0];
                this.description = undefined;
                break;
              }

              const values = Object.values(json);
              if (values.length === 1) {
                if (typeof values[0] === 'string') {
                  this.message = values[0];
                  this.description = undefined;
                  break;
                }

                if (
                  Array.isArray(values[0]) &&
                  values[0].length === 1 &&
                  typeof values[0][0] === 'string'
                ) {
                  this.message = values[0][0];
                  this.description = undefined;
                  break;
                }
              }

              const yaml = stringify(json);
              this.description = yaml;
            }
            break;
        }
      } catch {
        // Do Nothing
      }
    }
  }
}
