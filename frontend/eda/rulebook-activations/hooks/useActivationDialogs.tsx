import {
  Modal,
  ModalVariant,
  Stack,
  StackItem,
  TextContent,
  Text,
  TextVariants,
  Button,
} from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../framework';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';

export function useRelaunchActivation() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const relaunchActivation = useCallback(
    (activation: EdaRulebookActivation) =>
      setDialog(
        <ActionDialog
          title={t('Relaunch activation')}
          submitText={t('Relaunch')}
          is_danger={false}
          description={t('Are you sure you want to relaunch the rulebook activation below?')}
          resource={{ id: activation.id, name: activation.name }}
        />
      ),
    [t, setDialog]
  );
  return relaunchActivation;
}

export function useRestartActivation() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const restartActivation = useCallback(
    (activation: EdaRulebookActivation) =>
      setDialog(
        <ActionDialog
          title={t('Restart activation')}
          submitText={t('Restart')}
          is_danger={false}
          description={t('Are you sure you want to restart the rulebook activation below?')}
          resource={{ id: activation.id, name: activation.name }}
        />
      ),
    [t, setDialog]
  );
  return restartActivation;
}
export function useDisableActivation() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const disableActivation = useCallback(
    (activation: EdaRulebookActivation) =>
      setDialog(
        <ActionDialog
          title={t('Disable activation')}
          submitText={t('Disable')}
          is_danger={true}
          description={t('Are you sure you want to disable the rulebook activation below?')}
          resource={{ id: activation.id, name: activation.name }}
        />
      ),
    [t, setDialog]
  );
  return disableActivation;
}

export function ActionDialog({
  title,
  submitText,
  is_danger = false,
  description,
  resource,
  submitFn,
}: {
  title: string;
  description: string;
  submitText: string;
  is_danger: boolean;
  resource: { id: string; name: string };
  submitFn?: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);
  const onSubmit = () => {
    if (submitFn) {
      submitFn(resource?.id);
    }
    onClose();
  };
  return (
    <Modal
      title={title}
      isOpen
      onClose={onClose}
      variant={ModalVariant.small}
      titleIconVariant="warning"
      actions={[
        <Button
          key="submit"
          variant={is_danger ? 'danger' : 'primary'}
          type="button"
          id="confirm"
          ouiaId="confirm"
          onClick={onSubmit}
        >
          {submitText}
        </Button>,
        <Button key="cancel" ouiaId="cancel" variant="link" type="button" onClick={onClose}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.p}>{description}</Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.p}>
              <strong> {resource?.name} </strong>
            </Text>
          </TextContent>
        </StackItem>
      </Stack>
    </Modal>
  );
}
