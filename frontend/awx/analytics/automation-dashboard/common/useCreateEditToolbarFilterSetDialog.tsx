import {
  IFilterState,
  PageForm,
  PageFormSubmitHandler,
  PageFormTextInput,
  usePageAlertToaster,
  usePageDialog,
} from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { usePutRequest } from '@ansible/common-ui/crud/usePutRequest';
import { Modal, ModalBody, ModalHeader, ModalVariant } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { IDashboardFilterSet } from '../types';

type DashboardFilterSetFormValues = {
  name: string;
};

function CreateEditToolbarFilterSetDialog(
  props: Readonly<{
    title: string;
    description?: string;
    filterSet: IDashboardFilterSet;
    onComplete: (filterSet: IDashboardFilterSet) => void;
    onSuccess: (message: string) => void;
  }>
) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const { title, description, filterSet, onComplete, onSuccess } = props;
  const postRequest = usePostRequest<Omit<IDashboardFilterSet, 'id'>, IDashboardFilterSet>();
  const putRequest = usePutRequest<Omit<IDashboardFilterSet, 'id'>, IDashboardFilterSet>();
  const onClose = useCallback(() => setDialog(undefined), [setDialog]);

  const onSubmit: PageFormSubmitHandler<DashboardFilterSetFormValues> = async (data) => {
    const payload: Omit<IDashboardFilterSet, 'id'> = {
      name: data.name,
      filters: filterSet.filters,
      is_default: filterSet.is_default ?? false,
    };

    let response: IDashboardFilterSet;
    let successMessage: string;

    if (filterSet.id === undefined) {
      const url = metricsAPI`/dashboard_reports/filter_sets/`;
      successMessage = t('Report {{name}} successfully created.', { name: data.name });
      response = await postRequest(url, payload);
    } else {
      const url = metricsAPI`/dashboard_reports/filter_sets/${filterSet.id}/`;
      successMessage = t('Report {{name}} updated successfully.', { name: data.name });
      const putResponse = await putRequest(url, payload);
      response = putResponse ?? { ...filterSet, ...payload };
    }

    onComplete(response);
    onSuccess(successMessage);
    onClose();
  };

  return (
    <Modal
      ouiaId={title}
      isOpen
      onClose={onClose}
      variant={ModalVariant.small}
      tabIndex={0}
      aria-label={title}
      position={'top'}
    >
      <ModalHeader title={title} description={description} />
      <ModalBody style={{ paddingLeft: 0 }}>
        <PageForm<DashboardFilterSetFormValues>
          singleColumn
          disablePadding
          disableSubmitOnEnter
          submitText={filterSet.id === undefined ? t('Create report') : t('Save changes')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onClose}
          defaultValue={{ name: filterSet.name }}
        >
          <PageFormTextInput
            name={'name'}
            id={'name'}
            label={t('Report name')}
            placeholder={t('Enter report name')}
            isRequired
            maxLength={255}
          />
        </PageForm>
      </ModalBody>
    </Modal>
  );
}

export function useCreateEditToolbarFilterSetDialog(
  onComplete: (filterSet: IDashboardFilterSet) => void
) {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();

  return useCallback(
    (filterState: IFilterState, filterSet: IDashboardFilterSet) => {
      const newFilterSet = { ...filterSet, filters: JSON.stringify(filterState) };
      const isCreate = filterSet.id === undefined;
      const title = isCreate ? t('Create new report') : t('Update report');
      const description = isCreate
        ? t('Save the current filter configuration as a new report.')
        : t('This will update the report with the current name and filter configuration.');
      setDialog(
        <CreateEditToolbarFilterSetDialog
          title={title}
          description={description}
          filterSet={newFilterSet}
          onComplete={onComplete}
          onSuccess={(message) =>
            alertToaster.addAlert({ variant: 'success', title: message, timeout: 2000 })
          }
        />
      );
    },
    [setDialog, t, onComplete, alertToaster]
  );
}
