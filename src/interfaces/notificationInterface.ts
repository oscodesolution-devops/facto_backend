import { Document, Model } from "mongoose";

interface INotification extends Document {
  title: string;
  content: string;
}

interface NotificationModel extends Model<INotification> {}
export { NotificationModel, INotification };
