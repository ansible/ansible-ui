import { PageFormApplicationSelect } from './PageFormApplicationSelect';

describe('PageFormApplicatioSelect', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/applications/*',
        hostname: 'localhost',
      },
      {
        fixture: 'applications.json',
      }
    );
  });

  it('renders list of existing applications', () => {
    cy.mount(<PageFormApplicationSelect name="Application" />);
  });
});
