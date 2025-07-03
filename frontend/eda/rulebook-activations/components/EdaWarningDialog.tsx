import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalVariant,
  Divider,
} from '@patternfly/react-core';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useFrameworkTranslations } from '@ansible/ansible-ui-framework/useFrameworkTranslations';
import { PageDetail, PageDetails, usePageDialogs } from '../../../../framework';

const ModalBodyDiv = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 560px;
  overflow: hidden;
`;

export interface EdaWarningDialog<T extends object> {
  /** The title of the modal. */
  title: string;

  /** The prompt/description that shows up under the title. */
  prompt?: string;

  /** Messages that appear in the modal's body. */
  messages?: ReactNode[];

  /** The items to confirm. */
  items: T[];

  /** Callback called when the user confirms. */
  onConfirm: (item: T) => Promise<unknown>;
  onComplete?: (items: T[]) => void;

  /** Callback called when the dialog closes. */
  onClose?: () => void;

  /** The button text to perform the action. */
  actionButtonText: string;
}

function EdaWarningDialog<T extends object>(props: EdaWarningDialog<T>) {
  const { title, items, prompt, messages, onConfirm, onClose, onComplete, actionButtonText } =
    props;
  const { popDialog } = usePageDialogs();
  const [translations] = useFrameworkTranslations();

  const onCloseClicked = useCallback(() => {
    popDialog();
    onClose?.();
  }, [onClose, popDialog]);

  const onSubmitClicked = useCallback(async () => {
    onCloseClicked();
    await onConfirm(items[0]);
    return onComplete?.(items);
  }, [items, onCloseClicked, onComplete, onConfirm]);

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen
      onClose={onCloseClicked}
      aria-label={title}
      ouiaId={title}
    >
      <ModalHeader title={title} description={prompt} titleIconVariant="warning" />
      <Divider />
      <ModalBody style={{ paddingLeft: 0, paddingRight: 0 }}>
        {items?.length > 0 && (
          <ModalBodyDiv>
            {messages && (
              <PageDetails numberOfColumns="single">
                {messages.map((message) => (
                  <PageDetail data-cy="warning=prompt" key={message?.toString()}>
                    {message}
                  </PageDetail>
                ))}
              </PageDetails>
            )}
          </ModalBodyDiv>
        )}
      </ModalBody>
      <Divider />
      <ModalFooter>
        <Button
          id="submit"
          key="submit"
          ouiaId="submit"
          variant="primary"
          onClick={() => void onSubmitClicked()}
        >
          {actionButtonText}
        </Button>
        <Button id="cancel" key="cancel" variant="link" onClick={onCloseClicked}>
          {translations.cancelText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export function useEdaWarningDialog<T extends object>() {
  const { pushDialog, popDialog } = usePageDialogs();
  const [props, setProps] = useState<EdaWarningDialog<T>>();
  useEffect(() => {
    if (props) {
      const onCloseHandler = () => {
        setProps(undefined);
        props.onClose?.();
      };
      pushDialog(
        <EdaWarningDialog<T> {...props} onClose={onCloseHandler} onConfirm={props.onConfirm} />
      );
    } else {
      popDialog();
    }
  }, [popDialog, props, pushDialog]);
  return setProps;
}
