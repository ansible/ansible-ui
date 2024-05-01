export interface GoogleOAuth2 {
  name: string;
  oauth2Key: string;
  oauth2Secret: string;
  callbackUrl: string;
  accessTokenUrl: string;
  accessTokenMethod: string;
  authorizationUrl: string;
  revokeTokenMethod: string;
  revokeTokenUrl: string;
  redirectState: string;
  additionalFields: string;
  scopes: string[];
}
