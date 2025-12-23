import * as bcrypt from 'bcrypt';

export class PasswordUtil {
  static async hash(password: string, saltRounds: number = 10): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static validate(password: string, minLength: number = 8): boolean {
    return password.length >= minLength;
  }
}

