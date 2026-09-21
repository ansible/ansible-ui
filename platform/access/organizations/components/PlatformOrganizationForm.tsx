import {
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { awxErrorAdapter } from '@ansible/awx-ui/common/adapters/awxErrorAdapter';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { Credential as ControllerCredential } from '@ansible/awx-ui/interfaces/Credential';
import { InstanceGroup as ControllerInstanceGroup } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { Organization as ControllerOrganization } from '@ansible/awx-ui/interfaces/Organization';
import { useTranslation } from 'react-i18next';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useHasAwxService } from '../../../main/GatewayServices';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { OrganizationDetailsStep } from './steps/OrganizationDetailsStep';
import { OrganizationGalaxyCredentialsOrderStep } from './steps/OrganizationGalaxyCredentialsOrderStep';
import { OrganizationInstanceGroupsOrderStep } from './steps/OrganizationInstanceGroupsOrderStep';
import { OrganizationReviewStep } from './steps/OrganizationReviewStep';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '@ansible/common/interfaces/OptionsResponse';

export interface OrganizationWizardFormValues {
  organization: PlatformOrganization;
  instanceGroups?: ControllerInstanceGroup[];
  galaxyCredentials?: ControllerCredential[];
  executionEnvironment?: number;
  maxHosts?: number;
  opa_query_path?: string;
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
  const awxService = useHasAwxService();
  const { data: optionsData } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/organizations/`
  );
  const { data: awxOrganizationOptionsData } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/organizations/`
  );

  const mergedOptionsData =
    optionsData || awxOrganizationOptionsData
      ? {
          ...optionsData,
          actions: {
            ...optionsData?.actions,
            POST: {
              ...optionsData?.actions?.POST,
              ...awxOrganizationOptionsData?.actions?.POST,
            },
          },
        }
      : undefined;

  const steps: PageWizardStep[] = [
    {
      id: 'details',
      label: t('Organization details'),
      inputs: (
        <OrganizationDetailsStep
          controllerOrganization={controllerOrganization}
          managed={organization?.managed || false}
        />
      ),
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
      organization,
      galaxyCredentials: galaxyCredentials || [],
      instanceGroups: instanceGroups || [],
      executionEnvironment: controllerOrganization?.summary_fields?.default_environment?.id,
      maxHosts: controllerOrganization?.max_hosts || 0,
      opa_query_path: controllerOrganization?.opa_query_path,
    },
  };

  return (
    <PageLayout>
      <PageHeader
        title={
          organization
            ? t('Edit {{organizationName}}', { organizationName: organization?.name })
            : t('Create organization')
        }
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(PlatformRoute.Organizations) },
          {
            label: organization
              ? t('Edit {{organizationName}}', { organizationName: organization?.name })
              : t('Create organization'),
          },
        ]}
      />
      <PageWizard<OrganizationWizardFormValues>
        steps={steps}
        stepDefaults={defaultValues}
        onSubmit={props.handleSubmit}
        errorAdapter={awxErrorAdapter}
        optionsData={mergedOptionsData}
        disableGrid
      />
    </PageLayout>
  );
}
