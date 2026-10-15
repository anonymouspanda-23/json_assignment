import type { User } from "./user.type.ts";

export interface UserService {
  getById(id: string): Promise<User>;
  add(user: Omit<User, 'id'>): Promise<User>;
  deleteById(id: string): Promise<void>;
}