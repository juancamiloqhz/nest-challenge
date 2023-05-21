import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthDto, ChangePasswordDto, ChangeUserRoleDto, UpdateUserDto } from './dto';
import { JwtGuard } from './guard';
import { GetUser } from './decorator';
import { User } from '@prisma/client';


@Controller('users')
export class UserController {
  constructor(private userService: UserService) { }

  @Post('sign_up')
  signup(@Body() dto: AuthDto) {
    return this.userService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign_in')
  signin(@Body() dto: AuthDto) {
    return this.userService.signin(dto);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@GetUser() user: User) {
    return user;
  }

  @UseGuards(JwtGuard)
  @Patch()
  updateUser(@Body() dto: UpdateUserDto, @GetUser("id") userId: number) {
    return this.userService.updateUser(dto, userId);
  }

  @UseGuards(JwtGuard)
  @Patch('change_password')
  changePassword(@Body() dto: ChangePasswordDto, @GetUser() user: User) {
    return this.userService.changePassword(dto, user);
  }

  @UseGuards(JwtGuard)
  @Patch('change_role')
  changeRole(@Body() dto: ChangeUserRoleDto, @GetUser() user: User) {
    return this.userService.changeRole(dto, user);
  }
}

