import { Static, Type } from '@sinclair/typebox'

export const CreateOrganizationType = Type.Object({
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    organization: Type.Number(),
})

export const OrganizationType = Type.Intersect([
    CreateOrganizationType,
    Type.Object({
        type: Type.Literal('organization'),
        id: Type.Number(),
        created: Type.String(),
        modified: Type.String(),
        summary_fields: Type.Optional(
            Type.Object({
                related_field_counts: Type.Optional(
                    Type.Object({
                        users: Type.Number(),
                        teams: Type.Number(),
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
    }),
])

export type Organization = Static<typeof OrganizationType>
