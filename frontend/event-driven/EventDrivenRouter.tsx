import { Navigate, Route, Routes } from 'react-router-dom'
import { AutomationServersPage } from '../automation-servers/AutomationServersPage'
import { RouteE } from '../Routes'
import { EditProject } from './projects/EditProject'
import { ProjectDetails } from './projects/ProjectDetails'
import { Projects } from './projects/Projects'

export function EventDrivenRouter() {
  return (
    <Routes>
      <Route
        path={RouteE.EdaAutomationServers.replace(RouteE.EventDriven, '')}
        element={<AutomationServersPage />}
      />
      <Route
        path={RouteE.CreateEDAProject.replace(RouteE.EventDriven, '')}
        element={<EditProject />}
      />
      <Route
        path={RouteE.EditEDAProject.replace(RouteE.EventDriven, '')}
        element={<EditProject />}
      />
      <Route
        path={RouteE.EDAProjectDetails.replace(RouteE.EventDriven, '')}
        element={<ProjectDetails />}
      />
      <Route path={RouteE.EDAProjects.replace(RouteE.EventDriven, '')} element={<Projects />} />
      <Route path="*" element={<Navigate to={RouteE.Login} replace />} />
    </Routes>
  )
}
