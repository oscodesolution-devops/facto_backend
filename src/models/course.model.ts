import { CourseModel, ICourse } from "@/interfaces";
import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema<ICourse,CourseModel>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 80,
    },
    category: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    subtitleLanguage: String,
    duration: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["minutes", "hours", "days"],
        default: "minutes",
      },
    },
    totalLectures: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    lectures: [{
        type: mongoose.Types.ObjectId,
        ref:"Lecture"
    }],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CourseSchema.index({ title: "text", description: "text" });
CourseSchema.index({ category: 1 });
CourseSchema.index({ status: 1 });

// Virtual for course URL
CourseSchema.virtual("url").get(function () {
  return `/courses/${this._id}`;
});

// Pre-save middleware to update totalLectures
CourseSchema.pre("save", function (next) {
  if (this.lectures) {
    this.totalLectures = this.lectures.length;
  }
  next();
});

const Course = mongoose.model<ICourse, CourseModel>(
    "Course",
    CourseSchema,
    "Course"
  );
  
  export default Course;