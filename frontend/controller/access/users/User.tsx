import { Static, Type } from '@sinclair/typebox'

export const UserType = Type.Object({
    type: Type.Literal('user'),
    id: Type.Number(),
    modified: Type.String(),
    created: Type.String(),
    username: Type.String(),
    first_name: Type.String(),
    last_name: Type.String(),
    summary_fields: Type.Object({
        organization: Type.Object({
            id: Type.Number(),
            name: Type.String(),
        }),
    }),
})

export type User = Static<typeof UserType>
