import { ISubServiceRequirement, SubServiceRequirementModel } from "@/interfaces";
import mongoose from "mongoose";

const SubServiceRequirementSchema = new mongoose.Schema<ISubServiceRequirement,SubServiceRequirementModel>({
    subServiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubService',
        required: true,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
      },
      isMandatory: {
        type: Boolean,
        default: true,
      },
},{
    timestamps:true
})

const SubServiceRequirement = mongoose.model<ISubServiceRequirement, SubServiceRequirementModel>(
    "SubServiceRequirement",
    SubServiceRequirementSchema,
    "subServiceRequirement"
  );
  
  export default SubServiceRequirement;
  
