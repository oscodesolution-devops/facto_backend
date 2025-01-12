import { Document, Model } from "mongoose";

export interface IBlog extends Document {
  title: string;
  content: string;
  contentType: 'image' | 'video';
  contentUrl: string;
  reference: {
    title: string;
    url: string;
  };
  author: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  url: string; // Virtual
}

export interface BlogModel extends Model<IBlog> {
  // Add any static methods here if needed
}