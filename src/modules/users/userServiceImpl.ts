import type { User } from "./user.type.ts";
import type { UserService } from "./userService.ts";
import type { JsonUserRepository } from "./jsonUserRepository.ts";
import { NotFoundError } from "../../shared/utils/errors.ts";
import { randomUUID } from "crypto";

export class UserServiceImpl implements UserService {
  private userRepository: JsonUserRepository;

  constructor(userRepository: JsonUserRepository) {
    this.userRepository = userRepository;
  }

  public async getById(id: string): Promise<User> {
    const user = await this.userRepository.getById(id);

    if (!user || user.deleted) {
      throw new NotFoundError("User not found!");
    }

    return user;
  }

  public async add(user: Omit<User, 'id'>): Promise<User> {
    const userWithId: User = {
      id: randomUUID(),
      ...user,
    }

    return await this.userRepository.add(userWithId);
  }

  public async deleteById(id: string): Promise<void> {
    const user = await this.userRepository.getById(id);

    if (!user || user.deleted) {
      throw new NotFoundError("User not found!");
    }

    await this.userRepository.deleteById(id);
  }
}