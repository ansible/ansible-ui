import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormDataEditor } from '../../../../framework';
import { PageFormCheckbox } from '../../../../framework/PageForm/Inputs/PageFormCheckbox';
import { PageFormSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageFormHidden } from '../../../../framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormCredentialSelect } from '../../access/credentials/components/PageFormCredentialSelect';
import { QueryParams } from '../../common/useAwxView';
import { InventorySourceForm } from '../../interfaces/InventorySource';
import { PageFormProjectSelect } from '../projects/components/PageFormProjectSelect';
import { PageFormInventoryFileSelect } from './component/PageFormInventoryFileSelect';

export function InventorySourceSubForm() {
  const { t } = useTranslation();
  const isUpdateOnLaunchEnabled = useWatch<InventorySourceForm>({
    name: 'update_on_launch',
  });
  const source = useWatch<InventorySourceForm>({
    name: 'source',
  }) as string;
  const sourceTypes = [
    'ec2',
    'gce',
    'azure_rm',
    'vmware',
    'satellite6',
    'openstack',
    'rhv',
    'controller',
    'insights',
    'terraform',
    'openshift_virtualization',
  ];

  const handleQueryParams = (source: string): QueryParams => {
    switch (source) {
      case 'scm':
        return {
          credential_type__kind__in: 'cloud,kubernetes',
        };
      case 'ec2':
        return {
          credential_type__namespace: 'aws',
        };
      case 'openshift_virtualization':
        return {
          credential_type__namespace: 'kubernetes_bearer_token',
        };
      default:
        return {
          credential_type__namespace: source,
        };
    }
  };

  return (
    <>
      <PageFormHidden
        watch="source"
        hidden={(type: string) => !sourceTypes.includes(type) && type !== 'scm'}
      >
        <PageFormSection title={t('Source Details')}>
          <PageFormCredentialSelect<InventorySourceForm>
            name="credential"
            label={t('Credential')}
            labelHelp={t(
              'Select credentials for accessing the nodes this job will be ran against. You can only select one credential of each type. For machine credentials (SSH), checking "Prompt on launch" without selecting credentials will require you to select a machine credential at run time. If you select credentials and check "Prompt on launch", the selected credential(s) become the defaults that can be updated at run time.'
            )}
            isRequired={sourceTypes.slice(1).includes(source)}
            queryParams={handleQueryParams(source)}
          />
          <PageFormHidden watch="source" hidden={(type: string) => type !== 'scm'}>
            <PageFormProjectSelect<InventorySourceForm> name="source_project" isRequired />
            <PageFormInventoryFileSelect<InventorySourceForm>
              watch="source_project"
              name="source_path"
              isRequired
            />
          </PageFormHidden>

          <PageFormSingleSelect<InventorySourceForm>
            placeholder={t('Select a verbosity value')}
            name="verbosity"
            options={[
              { value: '0', label: t('0 (Warning)') },
              { value: '1', label: t('1 (Info)') },
              { value: '2', label: t('2 (Debug)') },
            ]}
            defaultValue={'1'}
            labelHelpTitle={t('Limit')}
            labelHelp={t(
              'Control the level of output ansible will produce as the playbook executes.'
            )}
            label={t('Verbosity')}
            isRequired
          />
          <PageFormTextInput<InventorySourceForm>
            name="host_filter"
            labelHelp={t(
              'Regular expression where only matching host names will be imported. The filter is applied as a post-processing step after any inventory plugin filters are applied.'
            )}
            label={t('Host filter')}
          />
          <PageFormTextInput<InventorySourceForm>
            name="enabled_var"
            labelHelp={t(
              "Retrieve the enabled state from the given dict of host variables. The enabled variable may be specified using dot notation, e.g: 'foo.bar'"
            )}
            label={t('Enabled variable')}
          />
          <PageFormTextInput<InventorySourceForm>
            name="enabled_value"
            labelHelp={t(
              'This field is ignored unless an Enabled Variable is set. If the enabled variable matches this value, the host will be enabled on import.'
            )}
            label={t('Enabled value')}
          />
          <PageFormSection title={t('Update options')}>
            <PageFormCheckbox<InventorySourceForm>
              label={t('Overwrite')}
              labelHelp={t(
                'If checked, any hosts and groups that were previously present on the external source but are now removed will be removed from the inventory. Hosts and groups that were not managed by the inventory source will be promoted to the next manually created group or if there is no manually created group to promote them into, they will be left in the "all" default group for the inventory. \nWhen not checked, local child hosts and groups not found on the external source will remain untouched by the inventory update process.'
              )}
              name="overwrite"
            />
            <PageFormCheckbox<InventorySourceForm>
              label={t('Overwrite variables')}
              labelHelp={t(
                'If checked, all variables for child groups and hosts will be removed and replaced by those found on the external source.\nWhen not checked, a merge will be performed, combining local variables with those found on the external source.'
              )}
              name="overwrite_vars"
            />
            <PageFormCheckbox<InventorySourceForm>
              label={t('Update on launch')}
              labelHelp={t(
                'Each time a job runs using this inventory, refresh the inventory from the selected source before executing job tasks.'
              )}
              name="update_on_launch"
            />
            {isUpdateOnLaunchEnabled ? (
              <PageFormSection title={t('Cache timeout (seconds)')}>
                <PageFormTextInput<InventorySourceForm>
                  name="update_cache_timeout"
                  placeholder={t('0')}
                  isRequired
                  type="number"
                />
              </PageFormSection>
            ) : null}
          </PageFormSection>
          <PageFormSection singleColumn>
            <PageFormDataEditor name="source_vars" label={t('Source variables')} format="yaml" />
          </PageFormSection>
        </PageFormSection>
      </PageFormHidden>
    </>
  );
}
