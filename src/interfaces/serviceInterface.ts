import mongoose from "mongoose";

interface IService extends mongoose.Document {
  title: string;
  description: string;
  category: string;
  isActive: boolean;
  icon:string;
}

interface ServiceModel extends mongoose.Model<IService> {}
export { ServiceModel,IService };
