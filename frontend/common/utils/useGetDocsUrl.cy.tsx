import { downstreamPaths, type DocPathDictionary } from './useGetDocsUrl';

// Helper function to check if anchor exists in HTML
const checkAnchorInHtml = (html: string, anchor: string): boolean => {
  const anchorPatterns = [
    `id="${anchor}"`,
    `id='${anchor}'`,
    `name="${anchor}"`,
    `name='${anchor}'`,
    `<a.*${anchor}.*>`,
  ];

  const checkPattern = (pattern: string): boolean => {
    try {
      return new RegExp(pattern).test(html) || html.includes(anchor);
    } catch {
      return html.includes(anchor);
    }
  };

  return anchorPatterns.some(checkPattern);
};

describe('Check Downstream Paths - Enhanced HTTP with Anchor Verification', () => {
  const version = '2.6';

  // Get ALL URLs that have anchor fragments
  const anchorUrls = (Object.entries(downstreamPaths) as Array<[keyof DocPathDictionary, string]>)
    .filter(([, value]) => value.includes('#'))
    .map(([key, value]) => ({
      key,
      fullUrl: `https://content-preview.docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/${version}/${value}`,
      path: value,
      anchor: value.split('#')[1],
    }));

  // Test non-anchored URLs (just HTTP status)
  const nonAnchorUrls = (
    Object.entries(downstreamPaths) as Array<[keyof DocPathDictionary, string]>
  )
    .filter(([, value]) => !value.includes('#'))
    .map(([key, value]) => ({
      key,
      fullUrl: `https://content-preview.docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/${version}/${value}`,
    }));

  nonAnchorUrls.forEach(({ key, fullUrl }) => {
    it.skip(`should return 200 for ${key}`, () => {
      cy.request({
        url: fullUrl,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  // Test anchored URLs with enhanced verification
  anchorUrls.forEach(({ key, fullUrl, anchor }) => {
    it.skip(`should return 200 AND contain anchor target for ${key} (#${anchor})`, () => {
      cy.request({
        url: fullUrl,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);

        // Check if the response body contains the anchor target
        const body = response.body as string;
        const hasAnchor = checkAnchorInHtml(body, anchor);

        expect(hasAnchor).to.be.true;
      });
    });
  });

  // Summary test showing anchor statistics
  it.skip('should identify all anchored URLs', () => {
    // Verify we have both anchored and non-anchored URLs
    expect(anchorUrls.length).to.be.greaterThan(0);
    expect(nonAnchorUrls.length).to.be.greaterThan(0);

    // Verify total matches expected
    const totalUrls = anchorUrls.length + nonAnchorUrls.length;
    const expectedTotal = Object.keys(downstreamPaths).length;
    expect(totalUrls).to.eq(expectedTotal);
  });
});
