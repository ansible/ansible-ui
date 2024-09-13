import { type AllowedHiddenFields, HiddenFields, RemoteFormProps } from '../RemoteForm';

function isAllowedHiddenField(key: keyof RemoteFormProps): key is AllowedHiddenFields {
  return !HiddenFields.includes(key as AllowedHiddenFields);
}

type RemoteFormPropsKey = keyof RemoteFormProps;
export function smartUpdate(modifiedRemote: RemoteFormProps, unmodifiedRemote: RemoteFormProps) {
  // Adapted from https://github.com/ansible/ansible-hub-ui/blob/625157662113cd68c3b121508fa8f64613339a71/src/api/ansible-remote.ts#L5
  if (modifiedRemote.hidden_fields) {
    delete modifiedRemote.hidden_fields;
  }

  if (modifiedRemote.my_permissions) {
    delete modifiedRemote.my_permissions;
  }

  Object.keys(modifiedRemote).forEach((key) => {
    const propKey = key as RemoteFormPropsKey;
    if (isAllowedHiddenField(propKey)) {
      if (modifiedRemote[propKey] === '' || modifiedRemote[propKey] === null) {
        delete modifiedRemote[propKey];
      }
    }
  });

  // Pulp complains if auth_url gets sent with a request that doesn't include a
  // valid token, even if the token exists in the database and isn't being changed.
  // To solve this issue, simply delete auth_url from the request if it hasn't
  // been updated by the user.
  if (modifiedRemote.auth_url === unmodifiedRemote.auth_url) {
    delete modifiedRemote.auth_url;
  }
  const keys = Object.keys(modifiedRemote) as RemoteFormPropsKey[];
  for (const field of keys) {
    if (isAllowedHiddenField(field)) {
      if (modifiedRemote[field] === null && unmodifiedRemote[field] === null) {
        // API returns headers:null but doesn't accept it .. and we don't edit headers
        delete modifiedRemote[field];
      }
    }
  }

  return modifiedRemote;
}
