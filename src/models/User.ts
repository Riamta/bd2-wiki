import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastLogin?: Date;
}

const UserSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);