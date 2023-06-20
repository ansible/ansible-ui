import { Route, Routes } from 'react-router-dom';
import { RouteObj, useRoutesWithoutPrefix } from '../Routes';
import { AutomationServers } from '../automation-servers/AutomationServers';
import { CredentialDetails } from './Resources/credentials/CredentialDetails';
import { Credentials } from './Resources/credentials/Credentials';
import { CreateCredential, EditCredential } from './Resources/credentials/EditCredential';
import { DecisionEnvironmentDetails } from './Resources/decision-environments/DecisionEnvironmentDetails';
import {
  CreateDecisionEnvironment,
  EditDecisionEnvironment,
} from './Resources/decision-environments/DecisionEnvironmentForm';
import { DecisionEnvironments } from './Resources/decision-environments/DecisionEnvironments';
import { CreateProject, EditProject } from './Resources/projects/EditProject';
import { ProjectDetails } from './Resources/projects/ProjectDetails';
import { Projects } from './Resources/projects/Projects';
import { EditGroup } from './UserAccess/Groups/EditGroup';
import { GroupDetails } from './UserAccess/Groups/GroupDetails';
import { Groups } from './UserAccess/Groups/Groups';
import { EditRole } from './UserAccess/Roles/EditRole';
import { RoleDetails } from './UserAccess/Roles/RoleDetails';
import { Roles } from './UserAccess/Roles/Roles';
import { CreateControllerToken } from './UserAccess/Users/CreateControllerToken';
import { EdaUserDetails } from './UserAccess/Users/EdaUserDetails';
import { CreateUser, EditUser } from './UserAccess/Users/EditUser';
import { Users } from './UserAccess/Users/Users';
import { EdaDashboard } from './dashboard/EdaDashboard';
import { ActivationInstanceDetails } from './rulebook-activations/ActivationInstanceDetails';
import { RulebookActivationDetails } from './rulebook-activations/RulebookActivationDetails';
import { CreateRulebookActivation } from './rulebook-activations/RulebookActivationForm';
import { RulebookActivations } from './rulebook-activations/RulebookActivations';
import { RulebookDetails } from './rulebooks/RulebookDetails';
import { Rulebooks } from './rulebooks/Rulebooks';
import { EditRule } from './rules/EditRule';
import { RuleDetails } from './rules/RuleDetails';
import { Rules } from './rules/Rules';
import { RuleAudit } from './views/RuleAudit/RuleAudit';
import { RuleAuditDetails } from './views/RuleAudit/RuleAuditDetails';

export function EventDrivenRouter() {
  const RouteObjWithoutPrefix = useRoutesWithoutPrefix(RouteObj.Eda);

  return (
    <Routes>
      <Route path={RouteObjWithoutPrefix.EdaAutomationServers} element={<AutomationServers />} />

      <Route path={RouteObjWithoutPrefix.EdaDashboard} element={<EdaDashboard />} />

      <Route path={RouteObjWithoutPrefix.CreateEdaProject} element={<CreateProject />} />
      <Route path={RouteObjWithoutPrefix.EditEdaProject} element={<EditProject />} />
      <Route path={RouteObjWithoutPrefix.EdaProjectDetails} element={<ProjectDetails />} />
      <Route path={RouteObjWithoutPrefix.EdaProjects} element={<Projects />} />

      <Route path={RouteObjWithoutPrefix.CreateEdaCredential} element={<CreateCredential />} />
      <Route path={RouteObjWithoutPrefix.EditEdaCredential} element={<EditCredential />} />
      <Route path={RouteObjWithoutPrefix.EdaCredentialDetails} element={<CredentialDetails />} />
      <Route path={RouteObjWithoutPrefix.EdaCredentials} element={<Credentials />} />
      <Route
        path={RouteObjWithoutPrefix.CreateEdaDecisionEnvironment}
        element={<CreateDecisionEnvironment />}
      />
      <Route
        path={RouteObjWithoutPrefix.EditEdaDecisionEnvironment}
        element={<EditDecisionEnvironment />}
      />
      <Route
        path={RouteObjWithoutPrefix.EdaDecisionEnvironmentDetails}
        element={<DecisionEnvironmentDetails />}
      />
      <Route
        path={RouteObjWithoutPrefix.EdaDecisionEnvironments}
        element={<DecisionEnvironments />}
      />

      <Route path={RouteObjWithoutPrefix.EdaRuleAuditDetails} element={<RuleAuditDetails />} />
      <Route path={RouteObjWithoutPrefix.EdaRuleAudit} element={<RuleAudit />} />

      <Route
        path={RouteObjWithoutPrefix.CreateEdaRulebookActivation}
        element={<CreateRulebookActivation />}
      />
      <Route
        path={RouteObjWithoutPrefix.EditEdaRulebookActivation}
        element={<CreateRulebookActivation />}
      />
      <Route
        path={RouteObjWithoutPrefix.EdaRulebookActivationDetails}
        element={<RulebookActivationDetails initialTabIndex={0} />}
      />
      <Route
        path={RouteObjWithoutPrefix.EdaRulebookActivationDetailsHistory}
        element={<RulebookActivationDetails initialTabIndex={1} />}
      />
      <Route
        path={RouteObjWithoutPrefix.EdaRulebookActivations}
        element={<RulebookActivations />}
      />
      <Route
        path={RouteObjWithoutPrefix.EdaActivationInstanceDetails}
        element={<ActivationInstanceDetails />}
      />

      {/* <Route path={RouteObjWithoutPrefix.CreateEdaActivity} element={<UnderDevelopment />} /> */}
      {/* <Route path={RouteObjWithoutPrefix.EditEdaActivity} element={<UnderDevelopment />} /> */}
      {/* <Route path={RouteObjWithoutPrefix.EdaActivityDetails} element={<UnderDevelopment />} /> */}
      <Route path={RouteObjWithoutPrefix.EdaRulebookDetails} element={<RulebookDetails />} />
      <Route path={RouteObjWithoutPrefix.EdaRulebooks} element={<Rulebooks />} />

      <Route path={RouteObjWithoutPrefix.CreateEdaRule} element={<EditRule />} />
      <Route path={RouteObjWithoutPrefix.EditEdaRule} element={<EditRule />} />
      <Route path={RouteObjWithoutPrefix.EdaRuleDetails} element={<RuleDetails />} />
      <Route path={RouteObjWithoutPrefix.EdaRules} element={<Rules />} />

      <Route path={RouteObjWithoutPrefix.EdaUsers} element={<Users />} />
      <Route path={RouteObjWithoutPrefix.CreateEdaUser} element={<CreateUser />} />
      <Route path={RouteObjWithoutPrefix.EditEdaUser} element={<EditUser />} />
      <Route
        path={RouteObjWithoutPrefix.CreateEdaControllerToken}
        element={<CreateControllerToken />}
      />
      <Route path={RouteObjWithoutPrefix.EdaUserDetails} element={<EdaUserDetails />} />
      <Route
        path={RouteObjWithoutPrefix.EdaUserDetails}
        element={<EdaUserDetails initialTabIndex={0} />}
      />
      <Route
        path={RouteObjWithoutPrefix.EdaUserDetailsTokens}
        element={<EdaUserDetails initialTabIndex={1} />}
      />

      <Route path={RouteObjWithoutPrefix.EdaGroups} element={<Groups />} />
      <Route path={RouteObjWithoutPrefix.CreateEdaGroup} element={<EditGroup />} />
      <Route path={RouteObjWithoutPrefix.EditEdaGroup} element={<EditGroup />} />
      <Route path={RouteObjWithoutPrefix.EdaGroupDetails} element={<GroupDetails />} />

      <Route path={RouteObjWithoutPrefix.EdaRoles} element={<Roles />} />
      <Route path={RouteObjWithoutPrefix.CreateEdaRole} element={<EditRole />} />
      <Route path={RouteObjWithoutPrefix.EditEdaRole} element={<EditRole />} />
      <Route path={RouteObjWithoutPrefix.EdaRoleDetails} element={<RoleDetails />} />
    </Routes>
  );
}
