const OIDC_NAMESPACES = ['hashivault-kv-oidc', 'hashivault-ssh-oidc'] as const;

export function isOidcCredential(namespace: string | undefined): boolean {
  return OIDC_NAMESPACES.includes(namespace as (typeof OIDC_NAMESPACES)[number]);
}
