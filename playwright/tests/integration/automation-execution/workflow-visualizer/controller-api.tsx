/** @deprecated Use controllerAPI from '@ansible/playwright/utils' instead */
export function controllerAPI(path: string) {
  return '/api/controller/v2' + path;
}
