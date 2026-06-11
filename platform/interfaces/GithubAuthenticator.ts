export interface GithubAuthenticator {
  name: string;
  callbackUrl: string;
  oauth2Key: string;
  oauth2Secret: string;
  additionalFields: string;
}
