import { Static, Type } from '@sinclair/typebox'

export const TeamType = Type.Object({
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    organization: Type.Number(),
    type: Type.Literal('team'),
    id: Type.Number(),
    created: Type.String(),
    modified: Type.String(),
    summary_fields: Type.Optional(
        Type.Object({
            organization: Type.Optional(
                Type.Object({
                    id: Type.Number(),
                    name: Type.String(),
                })
            ),
            created_by: Type.Optional(
                Type.Object({
                    id: Type.Number(),
                    username: Type.String(),
                    first_name: Type.String(),
                    last_name: Type.String(),
                })
            ),
            modified_by: Type.Optional(
                Type.Object({
                    id: Type.Number(),
                    username: Type.String(),
                    first_name: Type.String(),
                    last_name: Type.String(),
                })
            ),
        })
    ),
})

export type Team = Static<typeof TeamType>
