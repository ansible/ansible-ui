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
        summary_fields: Type.Object({
            related_field_counts: Type.Object({
                users: Type.Number(),
                teams: Type.Number(),
            }),
        }),
    }),
])

export type Organization = Static<typeof OrganizationType>
