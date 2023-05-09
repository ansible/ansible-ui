import { Button, Checkbox, Modal, ModalVariant, TextContent } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../framework';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

const CheckboxDiv = styled.div`
  margin-left: 10px;
`;

const HIDE_WELCOME_MESSAGE = 'hide-welcome-message';

export function WelcomeModal() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const onClose = useCallback(() => {
    setDialog(undefined);
  }, [setDialog]);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const handleChange = (checked: boolean) => {
    setIsChecked(checked);
    sessionStorage.setItem(HIDE_WELCOME_MESSAGE, JSON.stringify(checked));
  };

  return (
    <Modal
      title={t(`Welcome to the new Ansible user interface`)}
      variant={ModalVariant.small}
      isOpen
      onClose={onClose}
      actions={[
        <Button
          ouiaId="welcome-modal-close-button"
          key="close"
          onClick={() => {
            onClose();
          }}
          aria-label={t`Close`}
        >
          {t(`Close`)}
        </Button>,
      ]}
    >
      <TextContent>
        {t(
          `The new interface has been updated to provide a consistent and clean user experience. As a tech preview, not all areas within the new UI are immediately available. You can currently perform basic tasks such as create a job template and view a completed job run.`
        )}
      </TextContent>
      <br />
      <CheckboxDiv>
        <Checkbox
          label={t(`Do not show this message again.`)}
          isChecked={isChecked}
          onChange={handleChange}
          name="do-not-show-welcome-modal"
        />
      </CheckboxDiv>
    </Modal>
  );
}
