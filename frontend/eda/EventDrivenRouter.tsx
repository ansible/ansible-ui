import { Navigate, Route, Routes } from 'react-router-dom';
import { AutomationServers } from '../automation-servers/AutomationServers';
import { RouteE } from '../Routes';
import Dashboard from './dashboard/Dashboard';
import { EditExecutionEnvironment } from './execution-environments/EditExecutionEnvironment';
import { ExecutionEnvironmentDetails } from './execution-environments/ExecutionEnvironmentDetails';
import { ExecutionEnvironments } from './execution-environments/ExecutionEnvironments';
import { EditInventory } from './Resources/inventories/EditInventory';
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

export function EventDrivenRouter() {
  return (
    <Routes>
      <Route
        path={RouteE.EdaAutomationServers.replace(RouteE.Eda, '')}
        element={<AutomationServers />}
      />

      <Route path={RouteE.EdaDashboard.replace(RouteE.Eda, '')} element={<Dashboard />} />

      <Route path={RouteE.CreateEdaProject.replace(RouteE.Eda, '')} element={<EditProject />} />
      <Route path={RouteE.EditEdaProject.replace(RouteE.Eda, '')} element={<EditProject />} />
      <Route path={RouteE.EdaProjectDetails.replace(RouteE.Eda, '')} element={<ProjectDetails />} />
      <Route path={RouteE.EdaProjects.replace(RouteE.Eda, '')} element={<Projects />} />

      <Route
        path={RouteE.CreateEdaExecutionEnvironment.replace(RouteE.Eda, '')}
        element={<EditExecutionEnvironment />}
      />
      <Route
        path={RouteE.EditEdaExecutionEnvironment.replace(RouteE.Eda, '')}
        element={<EditExecutionEnvironment />}
      />
      <Route
        path={RouteE.EdaExecutionEnvironmentDetails.replace(RouteE.Eda, '')}
        element={<ExecutionEnvironmentDetails />}
      />
      <Route
        path={RouteE.EdaExecutionEnvironments.replace(RouteE.Eda, '')}
        element={<ExecutionEnvironments />}
      />

      <Route path={RouteE.CreateEdaInventory.replace(RouteE.Eda, '')} element={<EditInventory />} />
      <Route path={RouteE.EditEdaInventory.replace(RouteE.Eda, '')} element={<EditInventory />} />
      <Route
        path={RouteE.EdaInventoryDetails.replace(RouteE.Eda, '')}
        element={<InventoryDetails />}
      />
      <Route path={RouteE.EdaInventories.replace(RouteE.Eda, '')} element={<Inventories />} />

      <Route path={RouteE.CreateEdaAction.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />
      <Route path={RouteE.EditEdaAction.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />
      <Route
        path={RouteE.EdaActionDetails.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route path={RouteE.EdaActions.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />

      <Route
        path={RouteE.CreateEdaRulebookActivation.replace(RouteE.Eda, '')}
        element={<EditRulebookActivation />}
      />
      <Route
        path={RouteE.EditEdaRulebookActivation.replace(RouteE.Eda, '')}
        element={<EditRulebookActivation />}
      />
      <Route
        path={RouteE.EdaRulebookActivationDetails.replace(RouteE.Eda, '')}
        element={<RulebookActivationDetails />}
      />
      <Route
        path={RouteE.EdaRulebookActivations.replace(RouteE.Eda, '')}
        element={<RulebookActivations />}
      />

      <Route
        path={RouteE.CreateEdaActivity.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route path={RouteE.EditEdaActivity.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />
      <Route
        path={RouteE.EdaActivityDetails.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route path={RouteE.EdaActivities.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />
      <Route
        path={RouteE.EdaRulebookDetails.replace(RouteE.Eda, '')}
        element={<RulebookDetails />}
      />
      <Route path={RouteE.EdaRulebooks.replace(RouteE.Eda, '')} element={<Rulebooks />} />

      <Route path={RouteE.CreateEdaRule.replace(RouteE.Eda, '')} element={<EditRule />} />
      <Route path={RouteE.EditEdaRule.replace(RouteE.Eda, '')} element={<EditRule />} />
      <Route path={RouteE.EdaRuleDetails.replace(RouteE.Eda, '')} element={<RuleDetails />} />
      <Route path={RouteE.EdaRules.replace(RouteE.Eda, '')} element={<Rules />} />

      <Route path={RouteE.EdaUsers.replace(RouteE.Eda, '')} element={<Users />} />
      <Route path="*" element={<Navigate to={RouteE.AutomationServers} replace />} />
    </Routes>
  );
}
