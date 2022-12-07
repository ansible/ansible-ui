import { Static, Type } from '@sinclair/typebox';

export const RoleType = Type.Object({
  type: Type.Literal('role'),
  id: Type.Number(),
  name: Type.String(),
  summary_fields: Type.Object({
    resource_id: Type.Optional(Type.Number()),
    resource_name: Type.Optional(Type.String()),
    resource_type: Type.Optional(Type.String()),
    resource_type_display_name: Type.Optional(Type.String()),
  }),
});

export type Role = Static<typeof RoleType>;
