import mongoose, { Schema } from 'mongoose';
import { CodeData } from '@/types/auth';

const CodeSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  reward: { type: String, required: true },
  add_date: { type: String, required: true },
  end_date: { type: String, required: true },
  status: { type: String, enum: ['active', 'expired'], default: 'active' },
});

export default mongoose.models.Code || mongoose.model<CodeData>('Code', CodeSchema);