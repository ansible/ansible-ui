import {randomString} from "../../../../framework/utils/random-string";
// returns a string that is enough random
export function randomHubName(
  name: string,
): string {
  return 'hub_e2e_' + name + randomString(6);
}
