/** @deprecated Use lightspeedAPI from '@ansible/playwright/utils' instead */
export function lightspeedAPI(path: string) {
  return '/api/lightspeed/v1' + path;
}
