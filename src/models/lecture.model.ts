import { ILecture, LectureModel } from "@/interfaces";
import mongoose from "mongoose";

const LectureSchema = new mongoose.Schema<ILecture,LectureModel>({
    title: {
      type: String,
      required: true,
      maxlength: 80
    },
    subtitle: {
      type: String,
      maxlength: 120
    },
    lectureNumber: {
      type: Number,
      required: true
    },
    language: {
      type: String,
      required: true
    },
    subtitleLanguage: String,
    duration: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['minutes', 'hours', 'days'],
        default: 'minutes'
      }
    },
    thumbnail: {
      type: String,
      required: true
    },
    videoUrl: {
      type: String,
      required: true
    },
    courseLevel: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    isFree: {
        type: Boolean,
        required:true,
        default:false,
    }
  }, {
    timestamps: true
  });

  const Lecture = mongoose.model<ILecture, LectureModel>(
    "Lecture",
    LectureSchema,
    "lecture"
  );
  
  export default Lecture;