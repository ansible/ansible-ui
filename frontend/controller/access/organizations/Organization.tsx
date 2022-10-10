export interface Organization {
    type: 'organization'
    id: number
    name: string
    description?: string
    organization: number
    created: string
    modified: string
    summary_fields?: {
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
    }
}
