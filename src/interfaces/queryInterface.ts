import mongoose, { Document } from 'mongoose';

interface IQuery extends Document {
  name: string;
  email: string;
  phoneNo: number;
  query: string;
  comment: string;
}

interface QueryModel extends mongoose.Model<IQuery> {}

export { QueryModel, IQuery };