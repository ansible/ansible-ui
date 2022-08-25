import { ComponentClass } from 'react'

export interface IItemActionClick<T> {
    icon?: ComponentClass
    label: string
    onClick: (item: T) => void
}

export function isItemActionClick<T>(itemAction: IItemAction<T>): itemAction is IItemActionClick<T> {
    return 'onClick' in itemAction
}

export interface IItemActionSeperator {
    isSeparator: true
}

export function isItemActionSeperator<T>(itemAction: IItemAction<T>): itemAction is IItemActionSeperator {
    return 'isSeparator' in itemAction
}

export type IItemAction<T> = IItemActionClick<T> | IItemActionSeperator
