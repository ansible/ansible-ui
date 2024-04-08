import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalBoxBody, ModalVariant } from '@patternfly/react-core';
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

export function useDeleteSurveyDialog(onComplete: () => void) {
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
  onComplete: () => void;
  onError: (err: unknown) => void;
}) {
  const { questions, onClose, onComplete, onError } = props;
  const { t } = useTranslation();
  const pagination = usePaged(questions);
  const modalColumns = useSurveyColumns();
  const deleteSurvey = useDeleteSurvey({ onClose, onComplete, onError });

  return (
    <Modal
      titleIconVariant="danger"
      title={t('Delete survey')}
      aria-label={t('Delete survey')}
      ouiaId={t('Delete survey')}
      data-cy="delete-survey-dialog"
      variant={ModalVariant.medium}
      description={t(`Are you sure you want to delete the survey questions below?`)}
      isOpen
      onClose={props.onClose}
      actions={[
        <Button
          data-cy="survey-modal-delete-button"
          ouiaId="survey-modal-delete-button"
          key="delete"
          variant="danger"
          onClick={() => void deleteSurvey(questions)}
          aria-label={t`Confirm delete`}
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
              errorStateTitle="Error"
              emptyStateTitle="No items"
              autoHidePagination={true}
              disableBodyPadding
              {...pagination}
            />
          </ModalBodyDiv>
        </ModalBoxBody>
      )}
    </Modal>
  );
}
