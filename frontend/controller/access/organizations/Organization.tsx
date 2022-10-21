export interface Organization {
  type: 'organization'
  id: number
  name: string
  description?: string
  organization: number
  created: string
  modified: string
  summary_fields: {
    related_field_counts?: {
      users: number
      teams: number
    }
    created_by?: {
      id: number
      username: string
      first_name: string
      last_name: string
    }
    modified_by?: {
      id: number
      username: string
      first_name: string
      last_name: string
    }
    object_roles: {
      admin_role: {
        id: number
        name: string
        description: string
      }
      member_role: {
        id: number
        name: string
        description: string
      }
      read_role: {
        id: number
        name: string
        description: string
      }
    }
  }
}
