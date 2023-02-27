import { Route, Routes } from 'react-router-dom';
import { AutomationServers } from '../automation-servers/AutomationServers';
import { RouteObj, useRoutesWithoutPrefix } from '../Routes';
import Dashboard from './dashboard/Dashboard';
import { EditExecutionEnvironment } from './execution-environments/EditExecutionEnvironment';
import { ExecutionEnvironmentDetails } from './execution-environments/ExecutionEnvironmentDetails';
import { ExecutionEnvironments } from './execution-environments/ExecutionEnvironments';
import { Inventories } from './Resources/inventories/Inventories';
import { InventoryDetails } from './Resources/inventories/InventoryDetails';
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

      <Route
        path={RouteObjWithoutPrefix.CreateEdaExecutionEnvironment}
        element={<EditExecutionEnvironment />}
      />
      <Route
        path={RouteObjWithoutPrefix.EditEdaExecutionEnvironment}
        element={<EditExecutionEnvironment />}
      />
      <Route
        path={RouteObjWithoutPrefix.EdaExecutionEnvironmentDetails}
        element={<ExecutionEnvironmentDetails />}
      />
      <Route
        path={RouteObjWithoutPrefix.EdaExecutionEnvironments}
        element={<ExecutionEnvironments />}
      />
      <Route path={RouteObjWithoutPrefix.EdaInventoryDetails} element={<InventoryDetails />} />
      <Route path={RouteObjWithoutPrefix.EdaInventories} element={<Inventories />} />

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
    </Routes>
  );
}
