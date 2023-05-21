import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

export class ChangePasswordDto {
  @IsString()
  newPassword: string;

  @IsString()
  oldPassword: string;
}

export class ChangeUserRoleDto {
  @IsString()
  @IsEnum(Role)
  role: Role;
}