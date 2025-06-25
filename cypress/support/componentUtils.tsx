import { ReactNode } from 'react';
import { Routes, Route, Outlet } from 'react-router';
interface RenderRouteWithOutletContextProps<T> {
  context: T;
  children: ReactNode;
}

export const RenderRouteWithOutletContext = <T,>({
  context,
  children,
}: RenderRouteWithOutletContextProps<T>) => {
  return (
    <Routes>
      <Route path="/" element={<Outlet context={context} />}>
        <Route index element={children} />
      </Route>
    </Routes>
  );
};
