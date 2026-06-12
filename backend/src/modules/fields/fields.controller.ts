import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { CreateFieldDto, UpdateFieldDto } from './dto/field.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('fields')
export class FieldsController {
  constructor(private fieldsService: FieldsService) {}

  @Get()
  findAll(@Query('all') all?: string) {
    if (all === 'true') return this.fieldsService.findAllAdmin();
    return this.fieldsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateFieldDto) {
    return this.fieldsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateFieldDto) {
    return this.fieldsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.fieldsService.remove(id);
  }
}
