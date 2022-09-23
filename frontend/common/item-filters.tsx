import { useTranslation } from 'react-i18next'
import { IItemFilter } from '../../framework'

export function useEnabledFilter() {
    const { t } = useTranslation()
    const enabledFilter: IItemFilter<{ enabled?: boolean }> = {
        label: t('Enabled'),
        options: [
            {
                label: t('Enabled'),
                value: 'true',
            },
            {
                label: t('Disabled'),
                value: 'false',
            },
        ],
        filter: (item: { enabled?: boolean }, values: string[]) => {
            if (item.enabled === true) return values.includes('true')
            if (item.enabled === false) return values.includes('false')
            return false
        },
    }
    return enabledFilter
}
