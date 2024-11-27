import mongoose from "mongoose";

interface ILecture extends Document {
  title: string;
  subtitle?: string;
  lectureNumber: number;
  language: string;
  subtitleLanguage?: string;
  duration: {
    value: number;
    unit: "minutes" | "hours" | "days";
  };
  thumbnail: string;
  videoUrl: string;
  courseLevel: string;
  isFree: boolean;
}
interface LectureModel extends mongoose.Model<ILecture> {}
export { LectureModel,ILecture };