import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../_schema/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(payload: any): Promise<any> {
    const { password, ...rest } = payload;

    const exist = await this.userModel.findOne({
      email: rest.email,
      isDeleted: false,
    });

    if (exist) throw new ConflictException('User Already Exists!');

    const user = new this.userModel({ ...rest });

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    user.password = encryptedPassword;

    await user.save();

    return { message: 'User Register Successfully!' };
  }

  async loginUser(payload: any): Promise<any> {
    const { email, password } = payload;

    const fetchUser = await this.userModel.findOne({ email, isDeleted: false });
    if (!fetchUser) throw new NotFoundException('User Not Found!');

    const comapredPassword = await bcrypt.compare(password, fetchUser.password);

    if (comapredPassword) {
      return {
        token: await this.jwtService.signAsync({
          id: fetchUser._id,
          email: fetchUser.email,
          username: fetchUser.username,
        }),
        user: fetchUser,
        message: 'User Login Successfully!',
      };
    } else {
      throw new UnauthorizedException('Incorrect email or password!');
    }
  }
}
