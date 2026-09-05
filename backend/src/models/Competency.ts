import mongoose, { Schema, Document } from 'mongoose';

export interface ICompetency extends Document {
  name: string;
  category: string;
  description: string;
  globalRequiredLevel: number;
}

const competencySchema = new Schema<ICompetency>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  globalRequiredLevel: { type: Number, default: 3 }
});

export const Competency = mongoose.model<ICompetency>('Competency', competencySchema);
