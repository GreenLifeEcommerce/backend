import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'categories',
})
export class Category {
  @ApiProperty({
    description: 'ID of category',
    example: '64f8a8b8e4b0a1a1a1a1a1a1',
  })
  @ObjectIdColumn()
  @Transform(({ value }) => value?.toString())
  id: ObjectId;

  @ApiProperty({
    description: 'Name of category',
    example: 'Eco-friendly Products',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'Description of category',
    example: 'Reusable and sustainable products',
  })
  @Column()
  description: string;

  @ApiProperty({ description: 'Created date' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
