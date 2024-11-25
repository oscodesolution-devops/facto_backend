import mongoose from "mongoose";
interface ICourseLecture {
  title: string;
  videoUrl: string;
  duration: number;
  isPreview: boolean;
}

interface ICourse extends mongoose.Document {
  title: string;
  description: string;
  instructorId: mongoose.Types.ObjectId;
  price: number;
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  previewLectureUrl: string;
  lectures: ICourseLecture[];
}

interface CourseModel extends mongoose.Model<ICourse> {}
export { CourseModel,ICourse };
