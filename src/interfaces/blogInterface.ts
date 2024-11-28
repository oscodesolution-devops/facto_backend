import mongoose, { Document } from 'mongoose';

interface IBlog extends Document {
  title: string;
  content: string;
  imageUrl: string;
  reference: {
    title: string;
    url: string;
  };
  author?: string;
  tags?: string[];
}

interface BlogModel extends mongoose.Model<IBlog> {}

export { BlogModel, IBlog };