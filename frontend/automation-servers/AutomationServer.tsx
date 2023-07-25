import { IndexedDbItem } from './IndexDb';

export enum AutomationServerType {
  AWX = 'AWX',
  HUB = 'HUB',
  EDA = 'EDA',
  Galaxy = 'Galaxy',
}

export interface AutomationServer extends IndexedDbItem {
  type: AutomationServerType;
  name: string;
  url: string;
  isActive?: boolean;
}
