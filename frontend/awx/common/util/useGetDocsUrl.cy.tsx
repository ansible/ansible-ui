import { downstreamPaths } from './useGetDocsUrl';

describe('Check Donwstream Paths', () => {
  const version = '2.5';

  const urls = Object.values(downstreamPaths).map(
    (value) =>
      `https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/${version}/${value}`
  );

  urls.forEach((url) => {
    it(`should return 200 for ${url}`, () => {
      cy.request({
        url: url,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
