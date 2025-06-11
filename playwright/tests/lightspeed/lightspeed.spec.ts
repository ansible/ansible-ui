import { test, expect } from '@playwright/test';
import { setupAfter, setupBefore } from '../../commands/setup';
import { navigateTo } from '../../commands/navigateTo';

test.beforeEach(setupBefore({ path: '/' }));
test.afterEach(setupAfter);

test(
  'Ansible Lightspeed external Link Check: should open external link in a new tab',
  { tag: [] },
  async ({ page }) => {
    await navigateTo(page, 'Ansible Lightspeed');
    await expect(page.getByRole('heading')).toContainText(
      'Ansible Lightspeed with IBM watsonx Code Assistant'
    );
    const link = page.getByRole('link', { name: 'Get started' });
    await expect(link).toHaveAttribute(
      'href',
      'https://developers.redhat.com/products/ansible/lightspeed'
    );
    await expect(link).toHaveAttribute('target', '_blank');
  }
);
