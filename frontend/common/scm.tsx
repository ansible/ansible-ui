import { GitAltIcon } from '@patternfly/react-icons'
import { ReactNode } from 'react'

export function getScmType(project?: { scm_type: string }): { text: string; icon: ReactNode } | undefined {
    switch (project?.scm_type) {
        case 'git':
            return {
                text: 'Git',
                icon: <GitAltIcon color="#F1502F" />,
            }
        default:
            return undefined
    }
}
