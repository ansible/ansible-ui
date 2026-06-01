export interface Credential {
  id: number;
  name: string;
  credential_type: number;
}

export function getAddedAndRemovedCredentials(
  nodeCredentials: Credential[],
  promptCredentials: Credential[],
  templateCredentials: Credential[]
) {
  const aggregateCredentials = [...nodeCredentials, ...templateCredentials];

  const added = promptCredentials.filter(
    (promptCredential) =>
      !aggregateCredentials.find(
        (aggregateCredential) => aggregateCredential.id === promptCredential.id
      )
  );

  const removed = nodeCredentials.filter(
    (nodeCredential) =>
      !promptCredentials.find((promptCredential) => promptCredential.id === nodeCredential.id)
  );

  return { added, removed };
}
