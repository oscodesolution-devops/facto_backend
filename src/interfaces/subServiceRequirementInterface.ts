import mongoose from "mongoose";

interface ISubServiceRequirement {
  subServiceId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  isMandatory: boolean;
}

interface SubServiceRequirementModel extends mongoose.Model<ISubServiceRequirement> {}
export { SubServiceRequirementModel, ISubServiceRequirement };
