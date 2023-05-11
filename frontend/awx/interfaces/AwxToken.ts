import { UserAuthorizedToken } from './generated-from-swagger/api';

export interface AwxToken extends Omit<UserAuthorizedToken, 'id' | 'token'> {
  id: number;
  token: string;
}
