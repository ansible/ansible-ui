# Generated interfaces

This directory contains the following files:

1. `swagger.json` for the awx APIs (retrieved using the pull request <https://github.com/ansible/awx/pull/13197>).
2. `api.ts` which contains the generated Typescript interfaces for all the APIs from the swagger.json. (using the [swagger-typescript-api](https://www.npmjs.com/package/swagger-typescript-api) tool)

The generated files are meant to be used as a starting point to help with creating and updating the TS interfaces under `controller/interfaces/`.

- This is a snapshot of the generated TS interfaces that is subject to change as the APIs evolve.
- There are some discrepancies between swagger and the actual API responses so there could be some manual tweaking required while writing up the interface.

## Development

For example, to create an interface for `UnifiedJob`:

1. Create a file `Credential.ts` under `controller/interfaces`
2. Extend the interface from `./generated-from-swagger/api`'

    ```
    import { Credential as SwaggerCredential } from './generated-from-swagger/api';

    export interface Credential extends Omit<SwaggerCredential, 'id' | 'name'> {
      id: number;
      name: string;
    }
    ```
