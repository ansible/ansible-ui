import { Button, Modal, ModalBoxBody, ModalVariant } from '@patternfly/react-core';
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
  /** The title of the model. */
  title: string;

  /** The prompt/description that shows up under the title. */
  prompt?: string;

  /** Messgaes that appear in the modal's body. */
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
  }, [items, onCloseClicked, onComplete, onConfirm]) as () => void;

  return (
    <Modal
      titleIconVariant={'warning'}
      title={title}
      aria-label={title}
      ouiaId={title}
      description={prompt}
      variant={ModalVariant.medium}
      isOpen
      onClose={onCloseClicked}
      actions={[
        <Button
          id="submit"
          key="submit"
          ouiaId="submit"
          variant={'primary'}
          onClick={onSubmitClicked}
        >
          {actionButtonText}
        </Button>,
        <Button id="cancel" key="cancel" variant="link" onClick={onClose}>
          {translations.cancelText}
        </Button>,
      ]}
      hasNoBodyWrapper
    >
      {items?.length > 0 && (
        <ModalBoxBody style={{ paddingLeft: 0, paddingRight: 0 }}>
          <ModalBodyDiv>
            {messages && (
              <PageDetails numberOfColumns={'single'}>
                {messages?.length > 0 &&
                  messages.map((message) => (
                    <PageDetail data-cy="warning=prompt" key={message?.toString()}>
                      {message}
                    </PageDetail>
                  ))}
              </PageDetails>
            )}
          </ModalBodyDiv>
        </ModalBoxBody>
      )}
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
        <EdaWarningDialog<T> {...props} onClose={onCloseHandler} onConfirm={props?.onConfirm} />
      );
    } else {
      popDialog();
    }
  }, [popDialog, props, pushDialog]);
  return setProps;
}
