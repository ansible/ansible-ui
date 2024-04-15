import { randomString } from '../../framework/utils/random-string';

/**
 * Utility function to escape arguments for safe inclusion in shell commands.
 */
export function escapeForShellCommand(args: string[]) {
  let argsString = '';

  args.forEach((arg, index) => {
    if (arg.startsWith('-')) {
      // eg. "--tags a b c"
      // check if this arg can be split
      const subArgs = arg.split(' ');
      argsString =
        subArgs.length > 1
          ? escapeArgs(argsString + subArgs[0] + ' ', subArgs.slice(1, subArgs.length))
          : argsString + escapeString(arg);
    } else {
      argsString += escapeString(arg);
    }

    if (index < args.length - 1) {
      argsString += ' ';
    }
  });

  return argsString;
}

function escapeString(s: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unnecessary-type-assertion
  const newString = s.replaceAll(/[\\]/g, '\\$&');
  return `"${newString}"`;
}

function escapeArgs(argsString: string, args: string[]) {
  args.forEach((arg, index) => {
    argsString += escapeString(arg);

    if (index < args.length - 1) {
      argsString += ' ';
    }
  });

  return argsString;
}

export function randomE2Ename(name?: string): string {
  let randomName = 'e2e_';
  if (name) randomName += name + '_';
  return randomName + randomString(5, undefined, { isLowercase: true });
}
