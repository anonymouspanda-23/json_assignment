import type { User } from "./user.type.ts";

export interface UserRepository {
  getById(id: string): Promise<User | undefined>;
  add(user: User): Promise<User>;
  deleteById(id: string): Promise<void>;
}