import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class Category {
  @ApiProperty({
    description: 'ID of category',
    example: '64f8a8b8e4b0a1a1a1a1a1a1',
  })
  @Transform(({ value }) => value?.toString())
  _id: string;

  @ApiProperty({
    description: 'Name of category',
    example: 'Eco-friendly Products',
  })
  @Prop({ unique: true, required: true })
  name: string;

  @ApiProperty({
    description: 'Description of category',
    example: 'Reusable and sustainable products',
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
