import { encrypt } from '@weaving-flow/core';
import { prisma } from '../lib/prisma';

export class AuthService {
  async createUser(email: string, password: string, name?: string) {
    const hashedPassword = await encrypt(password, process.env.PASSWORD_SECRET || 'default-secret');
    
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });
  }

  async validateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return null;
    }

    const hashedPassword = await encrypt(password, process.env.PASSWORD_SECRET || 'default-secret');
    if (hashedPassword !== user.password) {
      return null;
    }

    return user;
  }
}
