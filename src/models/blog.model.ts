import mongoose from "mongoose";
import { BlogModel, IBlog } from "@/interfaces";

const BlogSchema = new mongoose.Schema<IBlog, BlogModel>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 120,
      trim: true
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    reference: {
      title: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true,
        validate: {
          validator: function(v: string) {
            // Basic URL validation
            return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
          },
          message: props => `${props.value} is not a valid URL!`
        }
      }
    },
    // Optional additional fields
    author: {
      type: String,
      default: 'Anonymous'
    },
    tags: [{
      type: String,
      trim: true
    }],
  },
  {
    timestamps: true
  }
);

// Indexes
BlogSchema.index({ title: 'text', content: 'text' });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ status: 1 });

// Virtual for blog URL
BlogSchema.virtual('url').get(function() {
  return `/blogs/${this._id}`;
});



const Blog = mongoose.model<IBlog, BlogModel>(
  'Blog', 
  BlogSchema, 
  'Blog'
);

export default Blog;