import mongoose from "mongoose";


interface ICourse extends Document {
  title: string;
  subtitle?: string;
  category: string;
  language: string;
  subtitleLanguage?: string;
  duration: {
    value: number;
    unit: 'minutes' | 'hours' | 'days'
  };
  totalLectures: number;
  price: number;
  description: string;
  lectures: mongoose.Types.ObjectId[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

interface CourseModel extends mongoose.Model<ICourse> {}
export { CourseModel,ICourse };
