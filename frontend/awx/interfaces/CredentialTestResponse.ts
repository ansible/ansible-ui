export interface CredentialTestResponse {
  status: 'success' | 'failed';
  details?: {
    sent_jwt_payload?: {
      aap_controller_organization_name?: string;
      aap_controller_job_template_name?: string;
      jti?: string;
      iss?: string;
      sub?: string;
      aud?: string;
      exp?: number;
      iat?: number;
      [key: string]: string | number | undefined;
    };
  };
}
