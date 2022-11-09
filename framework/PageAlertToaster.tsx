import { Alert, AlertActionCloseButton, AlertGroup, AlertProps } from '@patternfly/react-core'
import { createContext, ReactNode, useContext, useState } from 'react'

export type AlertToasterProps = AlertProps

export interface IPageAlertToaster {
  addAlert: (alert: AlertToasterProps) => void
  removeAlert: (alert: AlertToasterProps) => void
  replaceAlert: (oldAlert: AlertToasterProps, newAlert: AlertToasterProps) => void
  removeAlerts: (filter?: (alert: AlertToasterProps) => boolean) => void
}

export const PageAlertToasterContext = createContext<IPageAlertToaster>({})
export function usePageAlertToaster(): IPageAlertToaster {
  return useContext(PageAlertToasterContext)
}

export function PageAlertToasterProvider(props: { children: ReactNode }) {
  const [toasterAlerts, setToasterAlerts] = useState<AlertToasterProps[]>([])
  const [pageAlertToaster] = useState<IPageAlertToaster>(() => {
    function removeAlerts(filter?: (alert: AlertToasterProps) => boolean) {
      setToasterAlerts((alerts) => (filter ? alerts.filter(filter) : []))
    }
    function removeAlert(alert: AlertToasterProps) {
      setToasterAlerts((alerts) => alerts.filter((a) => a !== alert))
    }
    function addAlert(alert: AlertToasterProps) {
      if (Number.isInteger(alert.timeout)) {
        setTimeout(() => removeAlert(alert), alert.timeout as number)
        delete alert.timeout
      }
      setToasterAlerts((alerts) => [...alerts, alert])
    }
    function replaceAlert(oldAlert: AlertToasterProps, alert: AlertToasterProps) {
      setToasterAlerts((alerts) => {
        const oldAlertIndex = alerts.findIndex((a) => a === oldAlert)
        if (oldAlertIndex !== -1) {
          if (Number.isInteger(alert.timeout)) {
            setTimeout(() => removeAlert(alert), alert.timeout as number)
            delete alert.timeout
          }
          const newAlerts = [...alerts]
          newAlerts[oldAlertIndex] = alert
          return newAlerts
        }
        return alerts
      })
    }
    return { addAlert, removeAlert, removeAlerts, replaceAlert }
  })
  return (
    <PageAlertToasterContext.Provider value={pageAlertToaster}>
      <AlertGroup isToast isLiveRegion>
        {toasterAlerts.map((alertProps, index) => (
          <Alert
            {...alertProps}
            key={alertProps.key ?? alertProps.id ?? index}
            actionClose={
              <AlertActionCloseButton onClose={() => pageAlertToaster.removeAlert(alertProps)} />
            }
          />
        ))}
      </AlertGroup>
      {props.children}
    </PageAlertToasterContext.Provider>
  )
}
