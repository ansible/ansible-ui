export interface Repository {
    pulp_id: string
    name: string
    base_path: string
    repository: {
        name: string
        description?: string
        pulp_id: string
        pulp_last_updated: string
        content_count: number
        gpgkey: string | null
    }
}
