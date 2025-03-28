import { apiTag } from '@ansible/hub-ui/common/api/formatPath';
const COPY_MARKER_LENGTH = ' @ hh:mm:ss'.length;

export let edaApiPath = process.env.EDA_API_PREFIX;

export function setEdaApiPath(path: string) {
  edaApiPath = path;
}

export function edaAPI(strings: TemplateStringsArray, ...values: string[]) {
  return edaApiPath + apiTag(strings, ...values);
}
export function hasCopyNamePattern(name: string) {
  if (name?.length <= COPY_MARKER_LENGTH) {
    return false;
  }
  if (name.substring(name.length - COPY_MARKER_LENGTH, name.length - 8) !== ' @ ') {
    return false;
  }
  const regex = /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/;

  return regex.exec(name.substring(name.length - 8));
}
