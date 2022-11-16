export enum PFColorE {
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
  | 'green'
  | 'success'
  | 'blue'
  | 'info'
  | 'red'
  | 'danger'
  | 'yellow'
  | 'warning'
  | 'grey'
  | 'disabled'

export function getPatternflyColor(color: PFColor) {
  switch (color) {
    case 'green':
    case 'success':
      return pfSuccess
    case 'red':
    case 'danger':
      return pfDanger
    case 'yellow':
    case 'warning':
      return pfWarning
    case 'blue':
    case 'info':
      return pfInfo
    case 'grey':
    case 'disabled':
      return pfDisabled
  }
}

export const pfSuccess = 'var(--pf-global--success-color--100)'
export const pfDanger = 'var(--pf-global--danger-color--100)'
export const pfWarning = 'var(--pf-global--warning-color--100)'
export const pfInfo = 'var(--pf-global--info-color--100)'
export const pfDisabled = 'var(--pf-global--disabled-color--100)'

export enum LabelColorE {
  blue = 'blue',
  cyan = 'cyan',
  green = 'green',
  orange = 'orange',
  purple = 'purple',
  red = 'red',
  grey = 'grey',
}

export type LabelColor = 'blue' | 'cyan' | 'green' | 'orange' | 'purple' | 'red' | 'grey'
