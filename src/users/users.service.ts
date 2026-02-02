import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
  ): Promise<UserDocument | null> {
    // ✅ fix return type
    return this.userModel.findOne({ provider, providerId }).exec();
  }

  async createUser(data: Partial<User>): Promise<UserDocument> {
    // ✅ fix return type
    const user = new this.userModel(data);
    return user.save();
  }

  async findById(userId: string): Promise<UserDocument | null> {
    // ✅ fix return type
    const userObjectId = new Types.ObjectId(userId);
    return this.userModel.findById(userObjectId).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailWithPassword(email: string) {
    return this.userModel.findOne({ email }).select('+password').exec();
  }
}
