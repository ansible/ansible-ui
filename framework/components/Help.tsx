import { Button, Popover } from '@patternfly/react-core'
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons'
import { ReactNode } from 'react'

export function Help(props: { help?: ReactNode; title?: string }) {
    const { help, title } = props
    if (!help) return <></>
    return (
        <Popover headerContent={title} bodyContent={help} removeFindDomNode>
            <Button variant="link" style={{ padding: 0, marginLeft: '8px', verticalAlign: 'middle' }}>
                <OutlinedQuestionCircleIcon />
            </Button>
        </Popover>
    )
}
