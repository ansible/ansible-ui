import { AlertProps } from '@patternfly/react-core';
import { createContext, ReactNode, useContext, useState } from 'react';

export interface IPageAlerts {
  addAlert: (alert: AlertProps) => void;
  removeAlert: (alert: AlertProps) => void;
  replaceAlert: (oldAlert: AlertProps, newAlert: AlertProps) => void;
  removeAlerts: (filter?: (alert: AlertProps) => boolean) => void;
}

export const PageAlertsContext = createContext<IPageAlerts>({
  addAlert: () => null,
  removeAlert: () => null,
  replaceAlert: () => null,
  removeAlerts: () => null,
});

export const PageAlertsArrayContext = createContext<AlertProps[]>([]);

export function usePageAlerts(): IPageAlerts {
  return useContext(PageAlertsContext);
}

export function PageAlertsProvider(props: { children: ReactNode }) {
  const [toasterAlerts, setToasterAlerts] = useState<AlertProps[]>([]);
  const [pageAlerts] = useState<IPageAlerts>(() => {
    function removeAlerts(filter?: (alert: AlertProps) => boolean) {
      setToasterAlerts((alerts) => (filter ? alerts.filter(filter) : []));
    }
    function removeAlert(alert: AlertProps) {
      setToasterAlerts((alerts) => alerts.filter((a) => a !== alert));
    }
    function addAlert(alert: AlertProps) {
      if (Number.isInteger(alert.timeout)) {
        setTimeout(() => removeAlert(alert), alert.timeout as number);
        delete alert.timeout;
      }
      setToasterAlerts((alerts) => {
        const alertIndex = alerts.findIndex((a) => a === alert);
        if (alertIndex !== -1) {
          const newAlerts = [...alerts];
          newAlerts[alertIndex] = alert;
          return newAlerts;
        } else {
          return [...alerts, alert];
        }
      });
    }
    function replaceAlert(oldAlert: AlertProps, alert: AlertProps) {
      setToasterAlerts((alerts) => {
        const oldAlertIndex = alerts.findIndex((a) => a === oldAlert);
        if (oldAlertIndex !== -1) {
          if (Number.isInteger(alert.timeout)) {
            setTimeout(() => removeAlert(alert), alert.timeout as number);
            delete alert.timeout;
          }
          const newAlerts = [...alerts];
          newAlerts[oldAlertIndex] = alert;
          return newAlerts;
        }
        return alerts;
      });
    }
    return { addAlert, removeAlert, removeAlerts, replaceAlert };
  });
  return (
    <PageAlertsContext.Provider value={pageAlerts}>
      <PageAlertsArrayContext.Provider value={toasterAlerts}>
        {props.children}
      </PageAlertsArrayContext.Provider>
    </PageAlertsContext.Provider>
  );
}
