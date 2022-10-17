import { Static, Type } from '@sinclair/typebox'

export const AutomationServerType = Type.Object({
    name: Type.String(),
    url: Type.String(),
    type: Type.String(),
})

export type AutomationServer = Static<typeof AutomationServerType>
