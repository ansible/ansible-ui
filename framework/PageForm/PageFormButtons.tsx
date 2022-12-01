import { ActionGroup, Button, PageSection, Tooltip } from '@patternfly/react-core'
import { useFormState } from 'react-hook-form'
import { PageFormAlerts } from './PageFormAlerts'

export function PageFormButtons(props: {
  submitText: string
  cancelText: string
  onCancel: () => void
}) {
  const { errors } = useFormState()

  return (
    <div>
      <PageFormAlerts />
      <PageSection
        isFilled
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100%',
          borderTop: 'thin solid var(--pf-global--BorderColor--100)',
        }}
        variant="light"
      >
        <ActionGroup style={{ marginTop: 0 }}>
          {errors && Object.keys(errors).length > 0 ? (
            <Tooltip content={'Please fix validation errors'}>
              <Button type="submit" isAriaDisabled>
                {props.submitText}
              </Button>
            </Tooltip>
          ) : (
            <Button type="submit">{props.submitText}</Button>
          )}

          <Button type="button" variant="link" onClick={props.onCancel}>
            {props.cancelText}
          </Button>
        </ActionGroup>
      </PageSection>
    </div>
  )
}
