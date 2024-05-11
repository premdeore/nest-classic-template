import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { compare, hash } from 'bcrypt';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  @Transform(({ value }: { value: ObjectId }) => `${value}`)
  public _id?: string;

  @Prop({ required: true, trim: true })
  public username: string;

  @Prop({ required: true, unique: true, trim: true })
  public email: string;

  @Prop({ required: true, trim: true })
  public password!: string;

  isValidPassword: (candidatePassword: string) => Promise<boolean>;
}

export type UserDocument = User & Document;
export const USER_MODEL = User.name; // User

const schema = SchemaFactory.createForClass(User);
export const UserSchema = schema;

//password hashing
UserSchema.pre('save', async function (next) {
  const hashedPassword = await hash(this.password, 16);
  this.password = hashedPassword;
  next();
});

//Instance Methods compare password
schema.methods.isValidPassword = async function (
  this: UserDocument,
  candidatePassword: string,
) {
  const hashedPassword = this.password;
  const isMatched = await compare(candidatePassword, hashedPassword);

  return isMatched;
};
