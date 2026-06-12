import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private sanitize(user: { id: string; username: string; name: string; role: string; createdAt: Date }) {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map((u) => this.sanitize(u));
  }

  async create(dto: CreateUserDto) {
    const username = dto.username.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { username } });
    if (existing) throw new ConflictException('El usuario ya existe');

    const user = await this.prisma.user.create({
      data: {
        username,
        name: dto.name.trim(),
        password: await bcrypt.hash(dto.password, 10),
      },
    });

    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.username) {
      const username = dto.username.toLowerCase().trim();
      if (username !== user.username) {
        const existing = await this.prisma.user.findUnique({ where: { username } });
        if (existing) throw new ConflictException('El usuario ya existe');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.username && { username: dto.username.toLowerCase().trim() }),
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.password && { password: await bcrypt.hash(dto.password, 10) }),
      },
    });

    return this.sanitize(updated);
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) throw new BadRequestException('No puedes eliminar tu propio usuario');

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
