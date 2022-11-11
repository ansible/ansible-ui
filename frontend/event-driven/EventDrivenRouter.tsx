import { Navigate, Route, Routes } from 'react-router-dom'
import { AutomationServersPage } from '../automation-servers/AutomationServersPage'
import { RouteE } from '../Routes'
import Dashboard from './dashboard/Dashboard'
import { EditProject } from './projects/EditProject'
import { ProjectDetails } from './projects/ProjectDetails'
import { Projects } from './projects/Projects'
import { UnderDevelopment } from './under-development/UnderDevelopment'

export function EventDrivenRouter() {
  return (
    <Routes>
      <Route
        path={RouteE.EdaAutomationServers.replace(RouteE.Eda, '')}
        element={<AutomationServersPage />}
      />

      <Route path={RouteE.EdaDashboard.replace(RouteE.Eda, '')} element={<Dashboard />} />

      <Route path={RouteE.CreateEdaProject.replace(RouteE.Eda, '')} element={<EditProject />} />
      <Route path={RouteE.EditEdaProject.replace(RouteE.Eda, '')} element={<EditProject />} />
      <Route path={RouteE.EdaProjectDetails.replace(RouteE.Eda, '')} element={<ProjectDetails />} />
      <Route path={RouteE.EdaProjects.replace(RouteE.Eda, '')} element={<Projects />} />

      <Route
        path={RouteE.CreateEdaExecutionEnvironment.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route
        path={RouteE.EditEdaExecutionEnvironment.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route
        path={RouteE.EdaExecutionEnvironmentDetails.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route
        path={RouteE.EdaExecutionEnvironments.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />

      <Route
        path={RouteE.CreateEdaInventory.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route
        path={RouteE.EditEdaInventory.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route
        path={RouteE.EdaInventoryDetails.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route path={RouteE.EdaInventories.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />

      <Route path={RouteE.CreateEdaAction.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />
      <Route path={RouteE.EditEdaAction.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />
      <Route
        path={RouteE.EdaActionDetails.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route path={RouteE.EdaActions.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />

      <Route
        path={RouteE.CreateEdaRulebookActivation.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route
        path={RouteE.EditEdaRulebookActivation.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route
        path={RouteE.EdaRulebookActivationDetails.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route
        path={RouteE.EdaRulebookActivations.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
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
        path={RouteE.CreateEdaRulebook.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route path={RouteE.EditEdaRulebook.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />
      <Route
        path={RouteE.EdaRulebookDetails.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route path={RouteE.EdaRulebooks.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />

      <Route path={RouteE.CreateEdaRule.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />
      <Route path={RouteE.EditEdaRule.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />
      <Route
        path={RouteE.EdaProjectDetails.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route path={RouteE.EdaRules.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />

      <Route path="*" element={<Navigate to={RouteE.Login} replace />} />
    </Routes>
  )
}
