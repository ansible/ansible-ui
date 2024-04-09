import { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Modal, ModalBoxBody, ModalVariant } from '@patternfly/react-core';
import { usePageDialog, PageTable, usePageAlertToaster } from '../../../../../framework';
import { usePaged } from '../../../../../framework/PageTable/useTableItems';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { useDeleteSurvey } from './useDeleteSurvey';
import { useSurveyColumns } from './useSurveyColumns';
import type { Spec } from '../../../interfaces/Survey';

const ModalBodyDiv = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 560px;
  overflow: hidden;
  border-top: thin solid var(--pf-v5-global--BorderColor--100);
`;
const ConfirmBoxDiv = styled.div`
  margin-left: 32px;
  height: 64px;
  display: flex;
  align-items: center;
`;

export function useDeleteSurveyDialog(onComplete: (questions: Spec[]) => void) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const alertToaster = usePageAlertToaster();

  const onError = (error: unknown) => {
    const { genericErrors, fieldErrors } = awxErrorAdapter(error);
    alertToaster.addAlert({
      variant: 'danger',
      title: t('Failed to delete survey questions'),
      children: (
        <>
          {genericErrors?.map((err) => err.message)}
          {fieldErrors?.map((err) => err.message)}
        </>
      ),
    });
  };

  const deleteSurveyDialog = (questions: Spec[]) => {
    setDialog(
      <DeleteSurveyDialog
        questions={questions}
        onClose={() => setDialog(undefined)}
        onComplete={onComplete}
        onError={onError}
      />
    );
  };
  return deleteSurveyDialog;
}

function DeleteSurveyDialog(props: {
  questions: Spec[];
  onClose: () => void;
  onComplete: (questions: Spec[]) => void;
  onError: (err: unknown) => void;
}) {
  const { questions, onClose, onComplete, onError } = props;
  const { t } = useTranslation();
  const pagination = usePaged(questions);
  const modalColumns = useSurveyColumns();
  const deleteSurvey = useDeleteSurvey({ onClose, onComplete, onError });
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Modal
      isOpen
      hasNoBodyWrapper
      titleIconVariant="warning"
      title={t('Permanently delete survey questions')}
      aria-label={t('Delete survey')}
      ouiaId="delete-survey-dialog"
      data-cy="delete-survey-dialog"
      variant={ModalVariant.medium}
      onClose={props.onClose}
      actions={[
        <Button
          data-cy="survey-modal-delete-button"
          ouiaId="survey-modal-delete-button"
          key="delete"
          variant="danger"
          onClick={() => void deleteSurvey(questions)}
          aria-label={t`Confirm delete`}
          isAriaDisabled={!confirmed}
        >
          {t(`Delete`)}
        </Button>,
        <Button
          ouiaId="delete-survey-modal-cancel-button"
          key="cancel"
          variant="link"
          onClick={onClose}
        >
          {t(`Cancel`)}
        </Button>,
      ]}
    >
      {questions.length > 0 && (
        <ModalBoxBody style={{ paddingLeft: 0, paddingRight: 0 }}>
          <ModalBodyDiv>
            <PageTable<Spec>
              key="items"
              pageItems={pagination.paged}
              itemCount={questions.length}
              tableColumns={modalColumns}
              keyFn={(question) => question.variable}
              compact
              errorStateTitle={t`Error`}
              emptyStateTitle={t`No items`}
              autoHidePagination={true}
              disableBodyPadding
              {...pagination}
            />
          </ModalBodyDiv>
          <ConfirmBoxDiv>
            <Checkbox
              id="confirm"
              ouiaId="confirm"
              label={t('Yes, I confirm that I want to remove these {{count}} survey questions.', {
                count: questions.length,
              })}
              isChecked={confirmed}
              onChange={(_event, val) => setConfirmed(val)}
            />
          </ConfirmBoxDiv>
        </ModalBoxBody>
      )}
    </Modal>
  );
}
