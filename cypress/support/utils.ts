/**
 * Utility function to escape arguments for safe inclusion in shell commands.
 */
export function escapeForShellCommand(args: string) {
  const argsArray = args.split(' ');
  let argsString = '';

  for (let i = 0; i < argsArray.length; i++) {
    argsString += ' ';
    if (argsArray[i].startsWith('-') && i < argsArray.length - 1) {
      argsString += argsArray[i] + ' ' + `"${argsArray[i + 1]}"`;
      i += 1;
    } else {
      argsString += argsArray[i];
    }
  }

  return argsString;
}
