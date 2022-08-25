import { useCallback } from 'react'

export interface IItemFilter<T extends object> {
    label: string
    type?: 'search' | 'filter'
    options: {
        label: string
        value: string
    }[]
    filter: (item: T, values: string[]) => boolean
}

export function useItemFilter<T extends object>(items: T[], label: string, getItemValue: (item: T) => void): IItemFilter<T> {
    const values: Record<string, string> = {}
    for (const item of items) {
        const value = getItemValue(item)
        if (typeof value === 'string') {
            values[value] = value
        } else if (Array.isArray(value)) {
            for (const v of value) {
                if (typeof v === 'string') {
                    values[v] = v
                }
            }
        }
    }

    const filter = useCallback(
        (item: T, values: string[]) => {
            const value = getItemValue(item)
            if (typeof value === 'string') {
                return values.includes(value)
            } else if (Array.isArray(value)) {
                for (const v of value) {
                    if (values.includes(v)) return true
                }
            }
            return false
        },
        [getItemValue]
    )

    return {
        label,
        options: Object.keys(values)
            .sort()
            .map((value) => ({
                label: value,
                value,
            })),
        filter,
    }
}

export type IFilterState = Record<string, string[] | undefined>

export type SetFilterValues<T extends object> = (filter: IItemFilter<T>, values: string[]) => void
