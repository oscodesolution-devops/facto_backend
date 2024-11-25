import mongoose from "mongoose";

interface ISubService {
  serviceId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  features: string[];
  price: number;
  period: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'one_time';
  isActive: boolean;
}

interface SubServiceModel extends mongoose.Model<ISubService> {}
export { SubServiceModel, ISubService };

