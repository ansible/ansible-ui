import { Static, Type } from '@sinclair/typebox'

export const UserType = Type.Object({
    type: Type.Literal('user'),
    id: Type.Number(),
    modified: Type.String(),
    created: Type.String(),
    username: Type.String(),
    password: Type.Optional(Type.String()),
    first_name: Type.Optional(Type.String()),
    last_name: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    is_superuser: Type.Boolean(),
    is_system_auditor: Type.Boolean(),
    summary_fields: Type.Object({
        organization: Type.Optional(
            Type.Object({
                id: Type.Number(),
                name: Type.String(),
            })
        ),
        user_capabilities: Type.Object({
            delete: Type.Number(),
            edit: Type.String(),
        }),
        direct_access: Type.Array(Type.Object({})),
        indirect_access: Type.Optional(
            Type.Array(
                Type.Object({
                    descendant_roles: Type.Array(Type.String()),
                    role: Type.Object({
                        id: Type.Number(),
                        name: Type.String(),
                        description: Type.String(),
                        user_capabilities: Type.Object({
                            unattach: Type.Boolean(),
                        }),
                    }),
                })
            )
        ),
    }),
})

export type User = Static<typeof UserType>
