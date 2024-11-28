import mongoose from "mongoose";

interface IUser extends mongoose.Document {
  // username: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber: number;
  aadharNumber: number;
  panNumber: string;
  dateOfBirth: Date;
  profilePictureUrl?: string;
  role: "user" | "admin" | "employee";
  registrationDate: Date;
  lastLogin?: Date;
}

interface UserModel extends mongoose.Model<IUser> {}
export { UserModel, IUser };
