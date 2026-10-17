import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  age: number;
  gender?: string;
  condition: string;
  phone?: string;
  email?: string;
  doctorId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true, trim: true, index: true },
    age: { type: Number, required: true, min: 0, max: 150 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    condition: { type: String, required: true, trim: true, index: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  },
  { timestamps: true }
);

PatientSchema.index({ createdAt: -1 });
PatientSchema.index({ doctorId: 1, condition: 1 });

export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
