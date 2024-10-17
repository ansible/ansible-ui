const pathPattern = /^(\/[\w-./?%&=]*)?$/;

export function validateUrlPath(str: string | null) {
  if (!str) {
    return null;
  }

  if (pathPattern.test(str)) {
    return str;
  }

  return null;
}
