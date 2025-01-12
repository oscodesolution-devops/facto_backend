import mongoose from "mongoose";
interface IRequests {
  name: string;
  priceModifier: number;
  needsQuotation: boolean;
  inputType: "dropdown" | "checkbox";
  isMultipleSelect?: boolean;
  options?: { 
    title: string;
    priceModifier: number;
    needsQuotation: boolean;
  }[];
}
interface ISubService {
  serviceId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  features: string[];
  requests: IRequests[];
  price: number;
  period: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'one_time';
  isActive: boolean;
}

interface SubServiceModel extends mongoose.Model<ISubService> {}
export { SubServiceModel, ISubService };

