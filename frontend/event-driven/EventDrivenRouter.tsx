import { Navigate, Route, Routes } from 'react-router-dom'
import { RouteE } from '../Routes'
import { Projects } from './projects/Projects'

export function EventDrivenRouter() {
  return (
    <Routes>
      <Route path={RouteE.EDAProjects.replace(RouteE.EventDriven, '')} element={<Projects />} />
      <Route path="*" element={<Navigate to={RouteE.Login} replace />} />
    </Routes>
  )
}
