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
import { EdaRulebook } from '../../interfaces/EdaRulebook';

export function useDisableRulebook() {
  const [_, setDialog] = usePageDialog();
  const disableRulebook = useCallback(
    (rulebook: EdaRulebook) => setDialog(<DisableRulebookDialog rulebook={rulebook} />),
    [setDialog]
  );
  return disableRulebook;
}

export function DisableRulebookDialog({ rulebook }: { rulebook: EdaRulebook }) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);
  const onSubmit = () => {
    onClose();
  };
  const disabledStatus = rulebook.status === 'disabled';
  return (
    <Modal
      title={disabledStatus ? t('Enable rulebook') : t('Disable rulebook')}
      isOpen
      onClose={onClose}
      variant={ModalVariant.small}
      titleIconVariant="warning"
      actions={[
        <Button
          key="submit"
          variant={disabledStatus ? 'primary' : 'danger'}
          type="button"
          id="confirm"
          ouiaId="confirm"
          onClick={onSubmit}
        >
          {disabledStatus ? t('Enable') : t('Disable')}
        </Button>,
        <Button key="cancel" ouiaId="cancel" variant="link" type="button" onClick={onClose}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.p}>
              {disabledStatus
                ? t('Are you sure you want to enable the rulebook below?')
                : t('Are you sure you want to disable the rulebook below?')}
            </Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.p}>
              <strong> {rulebook?.name} </strong>
            </Text>
          </TextContent>
        </StackItem>
      </Stack>
    </Modal>
  );
}
