import { Route, Routes } from 'react-router-dom';
import { AutomationServersPage } from './AutomationServersPage';

export function AutomationServersRouter() {
  return (
    <Routes>
      <Route path="*" element={<AutomationServersPage />} />
    </Routes>
  );
}
