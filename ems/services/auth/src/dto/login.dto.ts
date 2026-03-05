export class LoginDto {
  tenantId!: string;
  email!: string;
  password!: string;
  userAgent?: string;
  ip?: string;
}
