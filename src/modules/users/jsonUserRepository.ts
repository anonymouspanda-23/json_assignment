import type { UserRepository } from "./userRepository.ts";
import type { User } from "./user.type.ts";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "users.json");

export class JsonUserRepository implements UserRepository {
  private users: User[] = [];

  public async initialize(): Promise<void> {
    try {
      const data = await fs.readFile(DATA_FILE, "utf8");
      this.users = JSON.parse(data);
    } catch (error) {
      console.error(`Failed to load users from JSON, initializing empty list. Reason: `, error);
      this.users = [];
    }
  }

  private async persistData(): Promise<void> {
    await fs.writeFile(DATA_FILE, JSON.stringify(this.users, null, 2), "utf8");
  }

  public async getById(id: string): Promise<User | undefined> {
    // Find first match if it exists, else return undefined
    return this.users.find(user => user.id === id);
  }

  public async add(newUser: User): Promise<User> {
    // Add user to in-memory DB first
    this.users.push(newUser);

    try {
      // Try to persist data to JSON file
      await this.persistData();

      // If data successfully written, return user object
      return newUser;
    } catch (error) {
      // If an error occurred while trying to persist data, rollback changes
      this.users = this.users.filter(user => user.id !== newUser.id);

      // Log the error
      console.error(`Failed to save user ${newUser.name}: `, error);

      // Throw an error to notify service and controller layers
      throw new Error("Database failed");
    }
  }

  public async deleteById(id: string): Promise<void> {
    // Take snapshot of current database for rollback
    const snapshot = [...this.users];

    // Update the deleted flag for the target user
    this.users = this.users.map(user =>
      user.id === id ? { ...user, deleted: true } : user
    );

    try {
      // Try to persist data to JSON file
      await this.persistData();
    } catch (error) {
      // If an error occurred while trying to persist data, rollback changes
      this.users = snapshot;

      // Log the error
      console.error(`Failed to delete user with ID ${id}: `, error);

      // Throw an error to notify service and controller layers
      throw new Error("Database failed");
    }
  }
}