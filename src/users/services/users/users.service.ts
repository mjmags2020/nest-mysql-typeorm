import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/typeorm/entities/Post';
import { Profile } from 'src/typeorm/entities/Profile';
import { User } from 'src/typeorm/entities/User';
import { CreateUserDto } from 'src/users/dtos/CreateUser.dto';
import { extractValuesFromParams } from 'src/utils/functions';
import {
  CreateUserParams,
  CreateUserPostParams,
  CreateUserProfileParams,
  UpdateUserParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private userProfileRepository: Repository<Profile>,
    @InjectRepository(Post) private userPostRepository: Repository<Post>,
  ) {}

  fetchUser() {
    return this.userRepository.find({ relations: ['profile', 'posts'] });
  }

  createUser(userDetails: CreateUserParams) {
    const newUser = this.userRepository.create({
      ...userDetails,
      createdAt: new Date(),
    });
    return this.userRepository.save(newUser);
  }

  updateUser(id: number, userDetails: UpdateUserParams) {
    return this.userRepository.update({ id }, { ...userDetails });
  }
  deleteUser(id: number) {
    return this.userRepository.delete({ id });
  }

  async createUserProfile(
    id: number,
    userProfileDetails: CreateUserProfileParams,
  ) {
    const user = await this.userRepository.findOneBy({ id });
    console.log('user', user);
    if (!user)
      throw new HttpException(
        'User not found. Cannnot create a Profile',
        HttpStatus.BAD_REQUEST,
      );
    const newUserProfile =
      this.userProfileRepository.create(userProfileDetails);
    const savedProfile = await this.userProfileRepository.save(newUserProfile);
    user.profile = savedProfile;
    return this.userRepository.save(user);
  }

  // Adding User with Profile record at once
  async createUserWithProfile(userProfileDetails: CreateUserProfileParams) {
    // This is just a onetime add route service
    // Identify the keys for user and profiles - Testing the 1-to-1 relationshhip
    const UserKeys: (keyof CreateUserParams)[] = ['username', 'password'];
    const ProfileKeys: (keyof CreateUserProfileParams)[] = [
      'firstName',
      'lastName',
      'age',
      'dob',
    ];

    const userDetails = extractValuesFromParams<CreateUserParams>(
      userProfileDetails,
      UserKeys,
    );
    const profileDetails = extractValuesFromParams<CreateUserProfileParams>(
      userProfileDetails,
      ProfileKeys,
    );

    const newUser = this.userRepository.create({
      ...userDetails,
      createdAt: new Date(),
    });
    const newUserRecord = await this.userRepository.save(newUser);

    // Save Profile record
    const newUserProfile = this.userProfileRepository.create(profileDetails);
    const savedProfile = await this.userProfileRepository.save(newUserProfile);

    // Update User with Profile rerord
    newUserRecord.profile = savedProfile;

    return this.userRepository.save(newUserRecord);
  }

  async createUserPost(id: number, createUserPostParams: CreateUserPostParams) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user)
      throw new HttpException(
        'User not found. Cannnot create a Profile',
        HttpStatus.BAD_REQUEST,
      );
    const newPost = this.userPostRepository.create({
      ...createUserPostParams,
      user,
    });
    const savePost = this.userPostRepository.save(newPost);
    return savePost;
  }
}
