import { UserStatus } from '../entities/user.entity';

export class CreateUserDto {
  email!: string;
  firstName!: string;
  lastName!: string;
  status?: UserStatus;
}
