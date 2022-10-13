import { CheckCircleIcon, ExclamationCircleIcon, QuestionCircleIcon } from '@patternfly/react-icons'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { getPatternflyColor, PatternFlyColor } from '../../framework'

export function getStatus(status?: string): { text: string; icon: ReactNode } | undefined {
    switch (status) {
        case 'completed':
            return {
                text: 'Successful',
                icon: <CheckCircleIcon color={getPatternflyColor(PatternFlyColor.Green)} style={{ marginRight: 6 }} />,
            }
        case 'successful':
            return {
                text: 'Successful',
                icon: <CheckCircleIcon color={getPatternflyColor(PatternFlyColor.Green)} style={{ marginRight: 6 }} />,
            }
        case 'failed':
            return {
                text: 'Failed',
                icon: <ExclamationCircleIcon color={getPatternflyColor(PatternFlyColor.Red)} style={{ marginRight: 6 }} />,
            }
        default:
            return {
                text: 'Unknown',
                icon: <QuestionCircleIcon color={getPatternflyColor(PatternFlyColor.Blue)} style={{ marginRight: 6 }} />,
            }
    }
}

export function StatusCell(props: { status: string }) {
    const { t } = useTranslation()
    switch (props.status) {
        case 'completed':
            return (
                <>
                    <CheckCircleIcon color={getPatternflyColor(PatternFlyColor.Green)} style={{ marginRight: 6 }} />
                    {t('Completed')}
                </>
            )
        case 'successful':
            return (
                <>
                    <CheckCircleIcon color={getPatternflyColor(PatternFlyColor.Green)} style={{ marginRight: 6 }} />
                    {t('Successful')}
                </>
            )
        case 'failed':
            return (
                <>
                    <ExclamationCircleIcon color={getPatternflyColor(PatternFlyColor.Red)} style={{ marginRight: 6 }} />
                    {t('Failed')}
                </>
            )
        default:
            return (
                <>
                    <QuestionCircleIcon color={getPatternflyColor(PatternFlyColor.Blue)} style={{ marginRight: 6 }} />
                    {t('Unknown')}
                </>
            )
    }
}
