import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFieldDto, UpdateFieldDto } from './dto/field.dto';

@Injectable()
export class FieldsService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    return this.prisma.fieldDefinition.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.fieldDefinition.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateFieldDto) {
    const name = dto.name.toLowerCase().replace(/\s+/g, '_');
    const existing = await this.prisma.fieldDefinition.findUnique({ where: { name } });
    if (existing) throw new ConflictException('El campo ya existe');

    return this.prisma.fieldDefinition.create({
      data: {
        name,
        label: dto.label,
        type: dto.type || 'CHECKBOX',
        required: dto.required ?? false,
        active: dto.active ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateFieldDto) {
    await this.findOne(id);
    return this.prisma.fieldDefinition.update({ where: { id }, data: dto });
  }

  async findOne(id: string) {
    const field = await this.prisma.fieldDefinition.findUnique({ where: { id } });
    if (!field) throw new NotFoundException('Campo no encontrado');
    return field;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.fieldDefinition.update({
      where: { id },
      data: { active: false },
    });
  }
}
