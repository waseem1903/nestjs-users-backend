import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userServices: UserService) {}

  @Post('register')
  async registerUser(@Body() payload: any) {
    return await this.userServices.registerUser(payload);
  }

  @Post('login')
  async loginUser(@Body() payload: any) {
    return await this.userServices.loginUser(payload);
  }
}
