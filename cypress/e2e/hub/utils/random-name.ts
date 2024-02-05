import { randomString } from '../../../../framework/utils/random-string';
export function randomHubName(name: string): string {
  return name + '_' + randomString(7, undefined, { isLowercase: true });
}
