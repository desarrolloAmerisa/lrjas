import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsUUID,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { Sex } from '@prisma/client';

export class CreateParticipantDto {
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  lastName: string;

  @IsString()
  motherLastName: string;

  @IsInt()
  @Min(18)
  @Max(45)
  age: number;

  @IsEnum(Sex)
  sex: Sex;

  @IsUUID()
  stakeId: string;

  @IsUUID()
  wardId: string;

  @IsOptional()
  @IsObject()
  dynamicFields?: Record<string, boolean>;
}

export class UpdateParticipantDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  motherLastName?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(45)
  age?: number;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @IsOptional()
  @IsUUID()
  stakeId?: string;

  @IsOptional()
  @IsUUID()
  wardId?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsObject()
  dynamicFields?: Record<string, boolean>;
}

export class ParticipantQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  stakeId?: string;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @IsOptional()
  @IsString()
  active?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;
}
