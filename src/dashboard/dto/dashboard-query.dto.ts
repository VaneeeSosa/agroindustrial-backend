import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class DashboardQueryDto {

  @IsOptional()
  @IsString()
  startDate?: string; // ISO

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  utm_campaign?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;
}