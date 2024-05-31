import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
} from '../../../../framework';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { OrganizationReviewStep } from './steps/OrganizationReviewStep';
import { OrganizationGalaxyCredentialsOrderStep } from './steps/OrganizationGalaxyCredentialsOrderStep';
import { OrganizationInstanceGroupsOrderStep } from './steps/OrganizationInstanceGroupsOrderStep';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { Organization as ControllerOrganization } from '../../../../frontend/awx/interfaces/Organization';
import { InstanceGroup as ControllerInstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Credential as ControllerCredential } from '../../../../frontend/awx/interfaces/Credential';
import { SummaryFieldsExecutionEnvironment } from '../../../../frontend/awx/interfaces/summary-fields/summary-fields';
import { useAwxService } from '../../../main/GatewayServices';
import { OrganizationDetailsStep } from './steps/OrganizationDetailsStep';

export interface OrganizationWizardFormValues {
  organization: PlatformOrganization;
  instanceGroups?: ControllerInstanceGroup[];
  galaxyCredentials?: ControllerCredential[];
  executionEnvironment?: SummaryFieldsExecutionEnvironment;
}

interface OrganizationFormProps {
  handleSubmit: (values: OrganizationWizardFormValues) => Promise<void>;
  instanceGroups?: ControllerInstanceGroup[];
  galaxyCredentials?: ControllerCredential[];
  organization?: PlatformOrganization;
  controllerOrganization?: ControllerOrganization;
}

export function PlatformOrganizationForm(props: OrganizationFormProps) {
  const { organization, controllerOrganization, instanceGroups, galaxyCredentials } = props;
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const awxService = useAwxService();

  const steps: PageWizardStep[] = [
    {
      id: 'details',
      label: t('Organization details'),
      inputs: <OrganizationDetailsStep controllerOrganization={controllerOrganization} />,
    },
    {
      id: 'instance_groups_order',
      label: t('Instance groups order'),
      inputs: <OrganizationInstanceGroupsOrderStep />,
      hidden: (wizardData) => {
        if (awxService) {
          // wizardData isn't updated until the next button is clicked
          if (!wizardData || Object.keys(wizardData).length === 0) {
            if (!instanceGroups || instanceGroups.length < 2) {
              return true;
            } else {
              return false;
            }
          }
          if (((wizardData as { instanceGroups?: object[] }).instanceGroups ?? []).length > 1) {
            return false;
          }
        }
        return true;
      },
    },
    {
      id: 'galaxy_credentials_order',
      label: t('Galaxy credentials order'),
      inputs: <OrganizationGalaxyCredentialsOrderStep />,
      hidden: (wizardData) => {
        if (awxService) {
          // wizardData isn't updated until the next button is clicked
          if (!wizardData || Object.keys(wizardData).length === 0) {
            if (!galaxyCredentials || galaxyCredentials.length < 2) {
              return true;
            } else {
              return false;
            }
          }
          if (
            ((wizardData as { galaxyCredentials?: object[] }).galaxyCredentials ?? []).length > 1
          ) {
            return false;
          }
        }
        return true;
      },
    },
    {
      id: 'review',
      label: t('Review'),
      element: <OrganizationReviewStep controllerOrganization={controllerOrganization} />,
    },
  ];

  const defaultValues = {
    details: {
      organization: organization || {},
      galaxyCredentials: galaxyCredentials || [],
      instanceGroups: instanceGroups || [],
      executionEnvironment: controllerOrganization?.summary_fields?.default_environment || {},
    },
  };

  return (
    <PageLayout>
      <PageHeader
        title={organization ? t('Edit Organization') : t('Create Organization')}
        breadcrumbs={[
          { label: t('Organization'), to: getPageUrl(PlatformRoute.Organizations) },
          { label: organization ? t('Edit Organization') : t('Create Organization') },
        ]}
      />
      <PageWizard<OrganizationWizardFormValues>
        steps={steps}
        defaultValue={defaultValues}
        onSubmit={props.handleSubmit}
        disableGrid
      />
    </PageLayout>
  );
}
