import { Static, Type } from '@sinclair/typebox';
import { AutomationServerType } from './AutomationServerType';

export const AutomationServerSchema = Type.Object({
  name: Type.String(),
  url: Type.String(),
  type: Type.Union([
    Type.Literal(AutomationServerType.AWX),
    Type.Literal(AutomationServerType.Galaxy),
    Type.Literal(AutomationServerType.EDA),
  ]),
});

export type AutomationServer = Static<typeof AutomationServerSchema>;

export function automationServerKeyFn(automationServer: AutomationServer) {
  return automationServer.name;
}
