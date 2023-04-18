export enum PFColorE {
  Default = 'default',
  Green = 'green',
  Success = 'success',
  Blue = 'blue',
  Info = 'info',
  Red = 'red',
  Danger = 'danger',
  Yellow = 'yellow',
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
  | 'warning'
  | 'grey'
  | 'disabled';

export function getPatternflyColor(color: PFColor) {
  switch (color) {
    case 'default':
      return undefined;
    case 'green':
      return pfSuccess200;
    case 'success':
      return pfSuccess;
    case 'red':
      return pfDanger200;
    case 'danger':
      return pfDanger;
    case 'yellow':
      return pfWarning200;
    case 'warning':
      return pfWarning;
    case 'blue':
      return pfInfo200;
    case 'info':
      return pfInfo;
    case 'grey':
      return pfDisabled200;
    case 'disabled':
      return pfDisabled;
  }
}

export const pfSuccess = 'var(--pf-global--success-color--100)';
export const pfSuccess200 = 'var(--pf-global--success-color--200)';
export const pfDanger = 'var(--pf-global--danger-color--100)';
export const pfDanger200 = 'var(--pf-global--danger-color--200)';
export const pfWarning = 'var(--pf-global--warning-color--100)';
export const pfWarning200 = 'var(--pf-global--warning-color--200)';
export const pfInfo = 'var(--pf-global--info-color--100)';
export const pfInfo200 = 'var(--pf-global--info-color-200)';
export const pfDisabled = 'var(--pf-global--disabled-color--100)';
export const pfDisabled200 = 'var(--pf-global--disabled-color--200)';
export const pfLink = 'var(--pf-global--link--Color)';

export enum LabelColorE {
  blue = 'blue',
  cyan = 'cyan',
  green = 'green',
  orange = 'orange',
  purple = 'purple',
  red = 'red',
  grey = 'grey',
}

export type LabelColor = 'blue' | 'cyan' | 'green' | 'orange' | 'purple' | 'red' | 'grey';
