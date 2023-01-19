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
import { EdaJob } from '../../interfaces/EdaJob';

export function useLaunchAction() {
  const [_, setDialog] = usePageDialog();
  const launchAction = useCallback(
    (job: EdaJob) => setDialog(<LaunchActionDialog job={job} />),
    [setDialog]
  );
  return launchAction;
}

export function LaunchActionDialog({ job }: { job: EdaJob }) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);
  const onSubmit = () => {
    onClose();
  };
  return (
    <Modal
      title={t('Launch action')}
      isOpen
      onClose={onClose}
      variant={ModalVariant.small}
      titleIconVariant="warning"
      actions={[
        <Button
          key="submit"
          variant={'primary'}
          type="button"
          id="confirm"
          ouiaId="confirm"
          onClick={onSubmit}
        >
          {t('Launch')}
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
              {t('Are you sure you want to launch the action below?')}
            </Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.p}>
              <strong> {job?.name || `Job ${job.id}`} </strong>
            </Text>
          </TextContent>
        </StackItem>
      </Stack>
    </Modal>
  );
}
