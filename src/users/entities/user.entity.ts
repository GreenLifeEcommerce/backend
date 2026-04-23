import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class User {
  @ApiProperty({
    description: 'ID of user',
    example: '64f8a8b8e4b0a1a1a1a1a1a1',
  })
  @Transform(({ value }) => value?.toString())
  _id: string;

  @ApiProperty({ description: 'Email of user', example: 'atest@email.com' })
  @Prop({ unique: true, required: true })
  email: string;

  @ApiProperty({
    description: 'Name of user',
    example: 'Nguyen Van A',
    required: false,
  })
  @Prop({ required: false })
  name?: string;

  @ApiHideProperty()
  @Prop({ required: true })
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({ description: 'Created date of user' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date of user' })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
