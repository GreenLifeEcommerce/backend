import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of category',
    example: 'Eco-friendly Products',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of category',
    example: 'Reusable and sustainable products',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateCategoryDto extends CreateCategoryDto {}
