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
import { EdaRuleset } from '../../interfaces/EdaRuleset';

export function useDisableRuleset(_onComplete: (ruleset: EdaRuleset) => void) {
  const [_, setDialog] = usePageDialog();
  const disableRuleset = useCallback(
    (ruleset: EdaRuleset) => setDialog(<DisableRulesetDialog ruleset={ruleset} />),
    [setDialog]
  );
  return disableRuleset;
}

export function DisableRulesetDialog({ ruleset }: { ruleset: EdaRuleset }) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);
  const onSubmit = () => {
    onClose();
  };
  const disabledStatus = ruleset?.fired_stats?.status === 'disabled';
  return (
    <Modal
      title={disabledStatus ? t('Enable ruleset') : t('Disable ruleset')}
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
                ? t('Are you sure you want to enable the ruleset below?')
                : t('Are you sure you want to disable the ruleset below?')}
            </Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.p}>
              <strong> {ruleset?.name} </strong>
            </Text>
          </TextContent>
        </StackItem>
      </Stack>
    </Modal>
  );
}
