export enum PFColorE {
  Default = 'default',
  Green = 'green',
  Success = 'success',
  Blue = 'blue',
  Info = 'info',
  Red = 'red',
  Danger = 'danger',
  Yellow = 'yellow',
  Orange = 'orange',
  Warning = 'warning',
  Grey = 'grey',
  Disabled = 'disabled',
}

export type PFColor =
  | 'default'
  | 'green'
  | 'success'
  | 'blue'
  | 'info'
  | 'red'
  | 'danger'
  | 'yellow'
  | 'orange'
  | 'warning'
  | 'grey'
  | 'disabled';

export function getPatternflyColor(color: PFColor) {
  switch (color) {
    case 'default':
      return undefined;
    case 'green':
    case 'success':
      return pfSuccess;
    case 'red':
    case 'danger':
      return pfDanger;
    case 'yellow':
    case 'orange':
    case 'warning':
      return pfWarning;
    case 'blue':
    case 'info':
      return pfInfo;
    case 'grey':
    case 'disabled':
      return pfDisabled;
  }
}

export const pfSuccess = 'var(--pf-t--global--color--status--success--default)';
export const pfDanger = 'var(--pf-t--global--color--status--danger--default)';
export const pfWarning = 'var(--pf-t--global--color--status--warning--default)';
export const pfInfo = 'var(--pf-t--global--color--status--info--default)';
export const pfDisabled = 'var(--pf-t--global--text--color--disabled)';
export const pfLink = 'var(--pf-t--global--text--color--link--default)';
export const pfUnreachable = 'var(--pf-t--global--color--status--danger--default)';
// pfTopologyInfo is to be used ONLY in topology-
// the default PatternFly info color in topology is blue, whereas it is purple everywhere else
export const pfTopologyInfo = 'var(--pf-topology__edge--m-info--EdgeFill)';

export enum LabelColorE {
  blue = 'blue',
  teal = 'teal',
  green = 'green',
  orange = 'orange',
  purple = 'purple',
  red = 'red',
  orangered = 'orangered',
  grey = 'grey',
  yellow = 'yellow',
}

export type LabelColor =
  | 'blue'
  | 'teal'
  | 'green'
  | 'orange'
  | 'purple'
  | 'red'
  | 'orangered'
  | 'grey'
  | 'yellow';
