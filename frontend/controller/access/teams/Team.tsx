import { Static, Type } from '@sinclair/typebox'

export const TeamType = Type.Object({
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    organization: Type.Number(),
    type: Type.Literal('team'),
    id: Type.Number(),
    created: Type.String(),
    modified: Type.String(),
    summary_fields: Type.Object({
        organization: Type.Object({
            id: Type.Number(),
            name: Type.String(),
        }),
    }),
})

export type Team = Static<typeof TeamType>
