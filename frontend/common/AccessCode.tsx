import { Bullseye, FormGroup, Page, PageSection, TextInput } from '@patternfly/react-core'
import { Fragment, ReactNode, useEffect, useState } from 'react'

export function AccessCode(props: { children: ReactNode }) {
    const [hasAccess, setHasAccess] = useState(() => localStorage.getItem('access') === 'true')
    useEffect(() => {
        if (hasAccess) {
            localStorage.setItem('access', 'true')
        }
    }, [hasAccess])
    if (!hasAccess)
        return (
            <Page>
                <PageSection>
                    <Bullseye>
                        <FormGroup fieldId="access-code" label="Access Code">
                            <TextInput
                                id="access-code"
                                placeholder="Enter access code"
                                onChange={(value) => setHasAccess(value === '6543')}
                            />
                        </FormGroup>
                    </Bullseye>
                </PageSection>
            </Page>
        )

    return <Fragment>{props.children}</Fragment>
}
