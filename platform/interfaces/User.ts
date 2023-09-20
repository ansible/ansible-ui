// import { User as SwaggerUser } from './generated-from-swagger/api';

export interface User {
  id: number;
  username: string;
  url: string;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
}
