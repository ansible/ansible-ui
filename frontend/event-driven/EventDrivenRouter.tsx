import { Navigate, Route, Routes } from 'react-router-dom'
import { AutomationServersPage } from '../automation-servers/AutomationServersPage'
import { RouteE } from '../Routes'
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

      <Route path={RouteE.EdaDashboard.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />

      <Route path={RouteE.CreateEdaProject.replace(RouteE.Eda, '')} element={<EditProject />} />
      <Route path={RouteE.EditEdaProject.replace(RouteE.Eda, '')} element={<EditProject />} />
      <Route path={RouteE.EdaProjectDetails.replace(RouteE.Eda, '')} element={<ProjectDetails />} />
      <Route path={RouteE.EdaProjects.replace(RouteE.Eda, '')} element={<Projects />} />

      <Route
        path={RouteE.EdaExecutionEnvironments.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route path={RouteE.EdaInventories.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />
      <Route path={RouteE.EdaActions.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />
      <Route
        path={RouteE.EdaRulebookActivations.replace(RouteE.Eda, '')}
        element={<UnderDevelopment />}
      />
      <Route path={RouteE.EdaActivities.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />
      <Route path={RouteE.EdaRulebooks.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />
      <Route path={RouteE.EdaRules.replace(RouteE.Eda, '')} element={<UnderDevelopment />} />

      <Route path="*" element={<Navigate to={RouteE.Login} replace />} />
    </Routes>
  )
}
