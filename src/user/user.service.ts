import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, ChangePasswordDto, ChangeUserRoleDto, UpdateUserDto } from './dto'
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) { }

  // (Helper function) This function is used to sign a token for a user
  async signToken(user: User): Promise<{ auth_token: string; user: Omit<User, "createdAt" | "updatedAt" | "password"> }> {
    const payload = { sub: user.id, email: user.email };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret,
    });
    return {
      auth_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    }
  }

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
        },
      });
      return await this.signToken(user);
    } catch (error) {
      if (error.constructor.name === Prisma.PrismaClientKnownRequestError.name) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials are taken');
        }
      }
      throw error;
    }
  }
  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Wrong credentials');
    }
    const isPasswordValid = await argon.verify(
      user.password,
      dto.password,
    );
    if (!isPasswordValid) {
      throw new ForbiddenException('Wrong password');
    }

    return await this.signToken(user);
  }

  async getAllUsers(user: User) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('You are not allowed');
    }
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  }

  async updateUser(dto: UpdateUserDto, userId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: dto,
    });
  }

  async changePassword(dto: ChangePasswordDto, user: User) {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!currentUser) {
      throw new ForbiddenException('User not found');
    }

    const isPasswordValid = await argon.verify(
      currentUser.password,
      dto.oldPassword,
    );
    if (!isPasswordValid) {
      throw new ForbiddenException('Wrong password');
    }
    const hash = await argon.hash(dto.newPassword);
    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hash,
      },
    });
  }

  async changeRole(dto: ChangeUserRoleDto, user: User) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('You are not allowed to do this');
    }
    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        role: dto.role,
      },
    });
  }

  async deleteUser(user: User) {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!currentUser) {
      throw new ForbiddenException('User not found');
    }

    return await this.prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  }

}
