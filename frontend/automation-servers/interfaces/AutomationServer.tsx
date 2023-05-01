import { AutomationServerType } from './AutomationServerType';

export interface AutomationServer {
  name: string;
  url: string;
  type: AutomationServerType.AWX | AutomationServerType.HUB | AutomationServerType.EDA;
}

export function automationServerKeyFn(automationServer: AutomationServer) {
  return automationServer.name;
}
