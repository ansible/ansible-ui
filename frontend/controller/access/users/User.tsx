import { Static, Type } from '@sinclair/typebox'

export const UserType = Type.Object({
    type: Type.Literal('user'),
    id: Type.Number(),
    modified: Type.String(),
    created: Type.String(),
    username: Type.String(),
    first_name: Type.String(),
    last_name: Type.String(),
    email: Type.String(),
    is_superuser: Type.Boolean(),
    is_system_auditor: Type.Boolean(),
    summary_fields: Type.Object({
        organization: Type.Object({
            id: Type.Number(),
            name: Type.String(),
        }),
        user_capabilities: Type.Object({
            delete: Type.Number(),
            edit: Type.String(),
        }),
    }),
})

export type User = Static<typeof UserType>
