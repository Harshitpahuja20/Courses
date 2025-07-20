import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  totalSubCourses: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
