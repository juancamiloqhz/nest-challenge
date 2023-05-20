import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthDto } from './dto';


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

}
