import { BanIcon, CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons'
import { useTranslation } from 'react-i18next'
import { PatternFlyColor, pfDanger, pfDisabled, pfInfo, pfSuccess, TextCell } from '../../framework'

export function StatusCell(props: { status?: string }) {
    const { t } = useTranslation()
    switch (props.status) {
        case 'disabled':
            return <TextCell icon={<BanIcon color={pfDisabled} />} iconSize="sm" text={t('Disabled')} textColor={PatternFlyColor.Grey} />
        case 'healthy':
            return (
                <TextCell
                    icon={<CheckCircleIcon color={pfSuccess} />}
                    iconSize="sm"
                    text={t('Healthy')}
                    textColor={PatternFlyColor.Green}
                />
            )
        case 'completed':
            return (
                <TextCell
                    icon={<CheckCircleIcon color={pfSuccess} />}
                    iconSize="sm"
                    text={t('Completed')}
                    textColor={PatternFlyColor.Green}
                />
            )
        case 'successful':
            return (
                <TextCell
                    icon={<CheckCircleIcon color={pfSuccess} />}
                    iconSize="sm"
                    text={t('Successful')}
                    textColor={PatternFlyColor.Green}
                />
            )
        case 'failed':
            return (
                <TextCell
                    icon={<ExclamationCircleIcon color={pfDanger} />}
                    iconSize="sm"
                    text={t('Failed')}
                    textColor={PatternFlyColor.Red}
                />
            )
        default:
            return (
                <TextCell
                    icon={<ExclamationTriangleIcon color={pfInfo} />}
                    iconSize="sm"
                    text={t('Unknown')}
                    textColor={PatternFlyColor.Yellow}
                />
            )
    }
}
