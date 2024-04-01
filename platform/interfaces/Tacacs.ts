export interface Tacacs {
  name: string;
  hostname: string;
  protocol: string;
  sharedSecret: string;
  clientAddressEnabled: boolean;
  additionalFields: string;
}
