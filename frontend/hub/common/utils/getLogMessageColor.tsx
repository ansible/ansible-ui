import { getPatternflyColor, PFColorE } from '@ansible/ansible-ui-framework';

export function getLogMessageColor(messageLevel: string) {
  const res = getPatternflyColor(
    messageLevel === 'WARNING'
      ? PFColorE.Warning
      : messageLevel === 'ERROR'
        ? PFColorE.Danger
        : PFColorE.Disabled
  );

  if (messageLevel === 'INFO') {
    return 'white';
  }
  return res;
}
