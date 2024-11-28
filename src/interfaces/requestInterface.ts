import mongoose from "mongoose";

interface IRequest {
  phoneNo:number;
  assignee: mongoose.Types.ObjectId;
}

interface RequestModel extends mongoose.Model<IRequest> {}
export { RequestModel, IRequest };

