import { storage } from '@/database/storage';
import { User, InsertUser } from '@shared/schema';
import { hashPassword, comparePassword } from './user.controller';

export class UserService {
  static async getUserById(id: string): Promise<User | undefined> {
    return storage.getUser(id);
  }

  static async getUserByUsername(username: string): Promise<User | undefined> {
    return storage.getUserByUsername(username);
  }

  static async getUserByEmail(email: string): Promise<User | undefined> {
    return storage.getUserByEmail(email);
  }

  static async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(userData.password);
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
    });
    return user;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    return storage.updateUser(id, updates);
  }

  static async validateUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await storage.getUserByEmail(email);
    if (!user) return null;

    const isValid = await comparePassword(password, user.password);
    return isValid ? user : null;
  }
}