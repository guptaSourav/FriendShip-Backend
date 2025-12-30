import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, AuthProvider } from './entities/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findByProviderId(
    provider: AuthProvider,
    providerId: string,
  ): Promise<UserDocument | null> {  // ✅ fix return type
    return this.userModel.findOne({ provider, providerId }).exec();
  }

  async createUser(data: Partial<User>): Promise<UserDocument> { // ✅ fix return type
    const user = new this.userModel(data);
    return user.save();
  }
  
  async findById(userId: string): Promise<UserDocument | null> { // ✅ fix return type
    return this.userModel.findById(userId).exec();
  }
}
