import { hashPassword, verifyPassword } from '@weaving-flow/core';
import { prisma } from '../lib/prisma';

export class AuthService {
  async createUser(email: string, password: string, name?: string) {
    const hashedPassword = hashPassword(password);
    
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

    if (!verifyPassword(password, user.password)) {
      return null;
    }

    return user;
  }

  async getCurrentUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });
  }
}
