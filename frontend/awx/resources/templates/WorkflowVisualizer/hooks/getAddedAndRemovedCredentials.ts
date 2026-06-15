export interface CredentialRef {
  id: number;
  name: string;
  credential_type: number;
}

export function getAddedAndRemovedCredentials(
  nodeCredentials: CredentialRef[],
  promptCredentials: CredentialRef[],
  templateCredentials: CredentialRef[]
) {
  const aggregateCredentials = [...nodeCredentials, ...templateCredentials];

  const added = promptCredentials.filter(
    (promptCredential) =>
      !aggregateCredentials.some(
        (aggregateCredential) => aggregateCredential.id === promptCredential.id
      )
  );

  const removed = nodeCredentials.filter(
    (nodeCredential) =>
      !promptCredentials.some((promptCredential) => promptCredential.id === nodeCredential.id)
  );

  return { added, removed };
}
