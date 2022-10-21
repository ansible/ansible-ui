export interface User {
  type: 'user'
  id: number
  modified: string
  created: string
  username: string
  password?: string
  first_name?: string
  last_name?: string
  email?: string
  is_superuser: boolean
  is_system_auditor: boolean
  summary_fields?: {
    organization?: {
      id: number
      name: string
    }

    user_capabilities?: {
      delete: number
      edit: string
    }
    // direct_access?: {}
    indirect_access?: {
      descendant_roles: string[]
      role: {
        id: number
        name: string
        description: string
        user_capabilities: {
          unattach: boolean
        }
      }
    }[]
  }
}
