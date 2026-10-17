import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true, trim: true, index: true },
    specialization: { type: String, required: true, trim: true, index: true },
    hospital: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

// Text search index for advanced querying
DoctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text', email: 'text' });
DoctorSchema.index({ createdAt: -1 });

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);
