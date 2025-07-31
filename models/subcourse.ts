// models/subCourse.model.ts
import mongoose from "mongoose";

const subCourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  gdriveUrl: { type: String, required: true }, // will be stored encoded
  index: { type: Number, required: true },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
});

export default mongoose.models.SubCourse ||
  mongoose.model("SubCourse", subCourseSchema);
