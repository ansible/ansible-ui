import { EdaControllerToken } from '../../../../frontend/eda/interfaces/EdaControllerToken';
import { EdaResult } from '../../../../frontend/eda/interfaces/EdaResult';

describe('EDA Cleanup', () => {
  before(() => cy.edaLogin());

  it('cleanup old admin awx tokens', () => {
    cy.request<EdaResult<EdaControllerToken>>('/api/eda/v1/users/me/awx-tokens/').then(
      (response) => {
        const tokens = response.body.results;
        const beforeTime = new Date(
          Date.now() - (30 + new Date().getTimezoneOffset()) * 60 * 60 * 1000
        ).toLocaleString();
        for (const token of tokens ?? []) {
          if (!token.created_at || token.created_at > beforeTime) continue;
          if (
            token.name &&
            (token.name.startsWith('E2E Token') || token.name.startsWith('AWX Token'))
          ) {
            cy.deleteEdaCurrentUserAwxToken(token);
          }
        }
      }
    );
  });
});
