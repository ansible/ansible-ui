export interface Project {
    type: 'project'
    id: number
    name: string
    description?: string
    created: string
    modified: string

    allow_override: boolean
    credential: string | null
    last_job_failed: boolean
    last_job_run: string
    last_update_failed: boolean
    last_updated: string
    local_path: string
    next_job_run: string | null
    organization: number | null
    scm_branch: string
    scm_clean: boolean
    scm_delete_on_update: boolean
    scm_refspec: string
    scm_revision: string
    scm_track_submodules: boolean
    scm_type: 'git'
    scm_update_cache_timeout: number
    scm_update_on_launch: boolean
    scm_url: string
    status: 'successful'
    summary_fields: {
        organization?: {
            id: number
            name: string
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

        last_job: {
            id: number
            name: string
            description: string
            finished: string
            failed: boolean
            status: 'successful'
        }
        last_update: {
            id: number
            name: string
            description: string
            finished: string
            failed: boolean
            status: 'successful'
        }
    }
}
