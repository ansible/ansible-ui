import { UserAuthorizedToken } from './generated-from-swagger/api';

export interface AwxToken extends Omit<UserAuthorizedToken, 'id'> {
  id: number;
}
