import { IsString, IsEnum, IsOptional, IsIn } from 'class-validator';
import { AttendanceMethod } from '@prisma/client';

export class CreateAttendanceDto {
  @IsString()
  code: string;

  @IsEnum(AttendanceMethod)
  method: AttendanceMethod;
}

export class AttendanceRangeQueryDto {
  @IsIn(['day', 'week', 'month'])
  period: 'day' | 'week' | 'month';

  @IsOptional()
  @IsString()
  date?: string;
}
