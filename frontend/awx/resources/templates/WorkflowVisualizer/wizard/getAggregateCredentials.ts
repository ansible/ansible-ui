import type { Credential } from '../../../../interfaces/Credential';

export type AggregateCredential =
  | {
      id: number;
      name: string;
      credential_type: number;
      passwords_needed: string[];
      vault_id?: string;
      inputs?: { [key: string]: string };
    }
  | Credential;

export function getAggregateCredentials(
  nodeCredentials: AggregateCredential[] = [],
  promptCredentials: AggregateCredential[] = [],
  templateCredentials: AggregateCredential[] = []
) {
  // Step 1: Get the aggregate credentials from the template and node
  const aggregateCredentialsMap: Record<number, AggregateCredential> = {};
  templateCredentials.forEach((templateCredential) => {
    aggregateCredentialsMap[templateCredential.credential_type] = templateCredential;
  });

  // Step 2: Override template credential with node credential if their types match
  nodeCredentials.forEach((nodeCredential) => {
    const key = nodeCredential.credential_type;
    if (aggregateCredentialsMap[key]?.id !== nodeCredential.id) {
      aggregateCredentialsMap[key] = nodeCredential;
    }
  });

  // Step 3: Override aggregate credential with prompt credential if their types match
  promptCredentials.forEach((promptCredential) => {
    const key = promptCredential.credential_type;
    if (aggregateCredentialsMap[key]?.id !== promptCredential.id) {
      aggregateCredentialsMap[key] = promptCredential;
    }
  });

  return Object.values(aggregateCredentialsMap);
}
