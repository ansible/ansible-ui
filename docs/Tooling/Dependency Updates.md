# Process for updating dependencies

## Option: Manual update

**1. Check for available update before upgrading (optional)**

Use [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) to run the following command:

```bash
ncu
```

OR

```bash
# To only view patch and minor upgrades
ncu --target minor
```

**2. Update packages**

1. Run `ncu -u` to update versions of packages in `package.json` based on the results of the check update command.
2. Run `npm ci`.
3. Run `npm audit fix`.
4. Run component and E2E tests to verify that the updated packages did not break anything.
5. Commit the updated `package.json` and `package-lock.json` file to a PR.

Example of PR containing dependency updates:
https://github.com/ansible/ansible-ui/pull/730

## Option: Automated update

```bash
npm run upgrade
```

This upgrade script takes care of:

- Running the check updates script
- Running upgrades on packages that have newer version available (updating them to the latest versions)
- Running `npm test` (lint, tsc, component tests) before and after updates to verify that the tests pass with the updated packages before applying the change.

**Note:** If a test fails then the script updates packages one by one and runs `npm test` after individual package updates. This could be a slow process depending on the number of errors and the number of package updates.

## npm audit failures

If there are npm audit failures we will need to assess which underlying packages are causing them. We can consider waiting to upgrade those packages and follow-up on upgrading them since patches containing security fixes are usually released soon after. If that does not work out, we would need to assess the exposure and utilize alternative packages if possible.
