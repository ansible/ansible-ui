import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons'
import { ReactNode } from 'react'
import { getPatternflyColor, PatternFlyColor } from '../../framework'

export function getStatus(project?: { status?: string }): { text: string; icon: ReactNode } | undefined {
    switch (project?.status) {
        case 'successful':
            return {
                text: 'Successful',
                icon: <CheckCircleIcon color={getPatternflyColor(PatternFlyColor.Green)} />,
            }
        case 'failed':
            return {
                text: 'Failed',
                icon: <ExclamationCircleIcon color={getPatternflyColor(PatternFlyColor.Red)} />,
            }
        default:
            return undefined
    }
}
