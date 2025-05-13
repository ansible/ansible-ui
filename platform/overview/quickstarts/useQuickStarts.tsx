import { QuickStart } from '@patternfly/quickstarts';
import { useMemo } from 'react';
import { useHasHubService } from '../../main/GatewayServices';
import { useGettingStartedWithAAPQSDeveloper } from './hooks/Automation developer/useGettingStartedWithAAPQSDev';
import { useEnvironmentsQS } from './hooks/Automation operator/useEnvironmentsQS';
import { useGettingStartedWithAAPQSOperator } from './hooks/Automation operator/useGetttingStartedWithAAPQSOperator';
import { useInventoriesQS } from './hooks/Automation operator/useInventoriesQS';
import { useProjectsQS } from './hooks/Automation operator/useProjectsQS';
import { useRulebookActivationQS } from './hooks/Automation operator/useRulebookActivationQS';
import { useTemplatesQS } from './hooks/Automation operator/useTemplatesQS';
import { useCreateDynamicInventoryQS } from './hooks/Platform Admin/useCreateDynamicInventoryQS';
import { useCreateOrganizationQS } from './hooks/Platform Admin/useCreateOrganizationQS';
import { useCreateTeamsQS } from './hooks/Platform Admin/useCreateTeamsQS';
import { useCreateUsersQS } from './hooks/Platform Admin/useCreateUsersQS';
import { useGettingStartedWithAAPQSAdmin } from './hooks/Platform Admin/useGettingStartedWithAAPQSAdmin';
import { useReviewRolesQS } from './hooks/Platform Admin/useReviewRolesQS';
import { useAnsibleLightspeedQS } from './hooks/useAnsibleLightspeedQS';
import { useAutomationMeshQS } from './hooks/useAutomationMeshQS';
import { useBuildDecisionEnvironmentsQS } from './hooks/useBuildDecisionEnvironmentsQS';
import { useBuildExecutionEnvironmentsQS } from './hooks/useBuildExecutionEnvironmentQS';
import { useCreateInventoryQS } from './hooks/useCreateInventoryQS';
import { useCreateJobTemplateQS } from './hooks/useCreateJobTemplateQS';
import { useCreateProjectQS } from './hooks/useCreateProjectQS';
import { useCreateRulebookActivationQS } from './hooks/useCreateRulebookActivationQS';
import { useFindingContentQuickStart } from './useFindingContentQuickStart';

export function useQuickStarts() {
  const hubService = useHasHubService();
  const GS1 = useGettingStartedWithAAPQSDeveloper();
  const GS2 = useGettingStartedWithAAPQSOperator();
  const GS3 = useGettingStartedWithAAPQSAdmin();
  const CreateProjectsQS = useCreateProjectQS();
  const AnsibleLightspeedQS = useAnsibleLightspeedQS();
  const EnvironmentsQS = useEnvironmentsQS();
  const InventoriesQS = useInventoriesQS();
  const ProjectsQS = useProjectsQS();
  const RulebookActivationQS = useRulebookActivationQS();
  const TemplatesQS = useTemplatesQS();
  const DyanmicInventoryQS = useCreateDynamicInventoryQS();
  const OrganizationQS = useCreateOrganizationQS();
  const TeamsQS = useCreateTeamsQS();
  const UsersQS = useCreateUsersQS();
  const ReviewRolesQS = useReviewRolesQS();
  const AutomationMeshQS = useAutomationMeshQS();
  const BuildDecisionEnvQS = useBuildDecisionEnvironmentsQS();
  const BuildExecutionEnvQS = useBuildExecutionEnvironmentsQS();
  const CreateInventoriesQS = useCreateInventoryQS();
  const CreateJobTemplateQS = useCreateJobTemplateQS();
  const CreateRulebookActivationQS = useCreateRulebookActivationQS();
  const findingContentQuickStart: QuickStart | undefined = useFindingContentQuickStart();
  const quickStarts = useMemo<QuickStart[]>(() => {
    const quickStarts: QuickStart[] = [
      AnsibleLightspeedQS,
      GS1,
      GS2,
      GS3,
      CreateProjectsQS,
      EnvironmentsQS,
      InventoriesQS,
      ProjectsQS,
      RulebookActivationQS,
      TemplatesQS,
      DyanmicInventoryQS,
      OrganizationQS,
      TeamsQS,
      UsersQS,
      ReviewRolesQS,
      AutomationMeshQS,
      BuildDecisionEnvQS,
      BuildExecutionEnvQS,
      CreateInventoriesQS,
      CreateJobTemplateQS,
      CreateRulebookActivationQS,
    ];
    if (hubService) {
      quickStarts.push(findingContentQuickStart);
    }
    return quickStarts;
  }, [
    AnsibleLightspeedQS,
    AutomationMeshQS,
    BuildDecisionEnvQS,
    BuildExecutionEnvQS,
    CreateInventoriesQS,
    CreateJobTemplateQS,
    CreateProjectsQS,
    CreateRulebookActivationQS,
    DyanmicInventoryQS,
    EnvironmentsQS,
    GS1,
    GS2,
    GS3,
    InventoriesQS,
    OrganizationQS,
    ProjectsQS,
    ReviewRolesQS,
    RulebookActivationQS,
    TeamsQS,
    TemplatesQS,
    UsersQS,
    findingContentQuickStart,
    hubService,
  ]);
  return quickStarts;
}
