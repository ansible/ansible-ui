import { Route, Routes } from 'react-router-dom';
import { AutomationServers } from '../automation-servers/AutomationServers';
import { RouteObj, useRoutesWithoutPrefix } from '../Routes';
import Dashboard from './dashboard/Dashboard';
import { EditDecisionEnvironment } from './decision-environments/EditDecisionEnvironment';
import { DecisionEnvironmentDetails } from './decision-environments/DecisionEnvironmentDetails';
import { DecisionEnvironments } from './decision-environments/DecisionEnvironments';
import { EditProject } from './Resources/projects/EditProject';
import { ProjectDetails } from './Resources/projects/ProjectDetails';
import { Projects } from './Resources/projects/Projects';
import { EditRulebookActivation } from './rulebook-activations/EditRulebookActivation';
import { RulebookActivationDetails } from './rulebook-activations/RulebookActivationDetails';
import { RulebookActivations } from './rulebook-activations/RulebookActivations';
import { RulebookDetails } from './rulebooks/RulebookDetails';
import { Rulebooks } from './rulebooks/Rulebooks';
import { EditRule } from './rules/EditRule';
import { RuleDetails } from './rules/RuleDetails';
import { Rules } from './rules/Rules';
import { UnderDevelopment } from './under-development/UnderDevelopment';
import { Users } from './UserAccess/Users/Users';
import { Actions } from './views/actions/Actions';
import { EditGroup } from './UserAccess/Groups/EditGroup';
import { GroupDetails } from './UserAccess/Groups/GroupDetails';
import { Groups } from './UserAccess/Groups/Groups';
import { EditRole } from './UserAccess/Roles/EditRole';
import { RoleDetails } from './UserAccess/Roles/RoleDetails';
import { Roles } from './UserAccess/Roles/Roles';
import { CreateUser, EditUser } from './UserAccess/Users/EditUser';
import { UserDetails } from './UserAccess/Users/UserDetails';
import { CredentialDetails } from './Resources/credentials/CredentialDetails';
import { EditCredential } from './Resources/credentials/EditCredential';
import { Credentials } from './Resources/credentials/Credentials';

export function EventDrivenRouter() {
  const RouteObjWithoutPrefix = useRoutesWithoutPrefix(RouteObj.Eda);

  return (
    <Routes>
      <Route path={RouteObjWithoutPrefix.EdaAutomationServers} element={<AutomationServers />} />

      <Route path={RouteObjWithoutPrefix.EdaDashboard} element={<Dashboard />} />

      <Route path={RouteObjWithoutPrefix.CreateEdaProject} element={<EditProject />} />
      <Route path={RouteObjWithoutPrefix.EditEdaProject} element={<EditProject />} />
      <Route path={RouteObjWithoutPrefix.EdaProjectDetails} element={<ProjectDetails />} />
      <Route path={RouteObjWithoutPrefix.EdaProjects} element={<Projects />} />

      <Route path={RouteObjWithoutPrefix.CreateEdaCredential} element={<EditCredential />} />
      <Route path={RouteObjWithoutPrefix.EditEdaCredential} element={<EditCredential />} />
      <Route path={RouteObjWithoutPrefix.EdaCredentialDetails} element={<CredentialDetails />} />
      <Route path={RouteObjWithoutPrefix.EdaCredentials} element={<Credentials />} />
      <Route
        path={RouteObjWithoutPrefix.CreateEdaDecisionEnvironment}
        element={<EditDecisionEnvironment />}
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

      <Route path={RouteObjWithoutPrefix.EdaActionDetails} element={<UnderDevelopment />} />
      <Route path={RouteObjWithoutPrefix.EdaActions} element={<Actions />} />

      <Route
        path={RouteObjWithoutPrefix.CreateEdaRulebookActivation}
        element={<EditRulebookActivation />}
      />
      <Route
        path={RouteObjWithoutPrefix.EditEdaRulebookActivation}
        element={<EditRulebookActivation />}
      />
      <Route
        path={RouteObjWithoutPrefix.EdaRulebookActivationDetails}
        element={<RulebookActivationDetails />}
      />
      <Route
        path={RouteObjWithoutPrefix.EdaRulebookActivations}
        element={<RulebookActivations />}
      />

      <Route path={RouteObjWithoutPrefix.CreateEdaActivity} element={<UnderDevelopment />} />
      <Route path={RouteObjWithoutPrefix.EditEdaActivity} element={<UnderDevelopment />} />
      <Route path={RouteObjWithoutPrefix.EdaActivityDetails} element={<UnderDevelopment />} />
      <Route path={RouteObjWithoutPrefix.EdaActivities} element={<UnderDevelopment />} />
      <Route path={RouteObjWithoutPrefix.EdaRulebookDetails} element={<RulebookDetails />} />
      <Route path={RouteObjWithoutPrefix.EdaRulebooks} element={<Rulebooks />} />

      <Route path={RouteObjWithoutPrefix.CreateEdaRule} element={<EditRule />} />
      <Route path={RouteObjWithoutPrefix.EditEdaRule} element={<EditRule />} />
      <Route path={RouteObjWithoutPrefix.EdaRuleDetails} element={<RuleDetails />} />
      <Route path={RouteObjWithoutPrefix.EdaRules} element={<Rules />} />

      <Route path={RouteObjWithoutPrefix.EdaUsers} element={<Users />} />
      <Route path={RouteObjWithoutPrefix.CreateEdaUser} element={<CreateUser />} />
      <Route path={RouteObjWithoutPrefix.EditEdaUser} element={<EditUser />} />
      <Route path={RouteObjWithoutPrefix.EdaUserDetails} element={<UserDetails />} />

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
