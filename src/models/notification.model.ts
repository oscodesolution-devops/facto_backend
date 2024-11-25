import {
  INotification,
  NotificationModel,
} from "@/interfaces/notificationInterface";
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema<
  INotification,
  NotificationModel
>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model<INotification, NotificationModel>(
  "Notification",
  NotificationSchema,
  "notification"
);

export default Notification;
