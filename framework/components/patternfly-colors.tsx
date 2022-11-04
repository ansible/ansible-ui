export enum PatternFlyColor {
  Green = 'green',
  Blue = 'blue',
  Red = 'red',
  Yellow = 'yellow',
  Grey = 'grey',
}

export function getPatternflyColor(color: PatternFlyColor) {
  switch (color) {
    case 'green':
      return pfSuccess
    case 'red':
      return pfDanger
    case 'yellow':
      return pfWarning
    case 'blue':
      return pfInfo
    case 'grey':
      return pfDisabled
  }
  return undefined
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
