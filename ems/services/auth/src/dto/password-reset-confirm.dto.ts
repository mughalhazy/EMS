export class PasswordResetConfirmDto {
  tenantId!: string;
  userId!: string;
  token!: string;
  newPassword!: string;
}
