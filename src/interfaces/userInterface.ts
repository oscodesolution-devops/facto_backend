import mongoose from "mongoose";

interface IBankDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

interface IGSTProfile {
  gstNumber: string;
  gstId: string;
  gstPassword: string;
  gstRegisteredPhoneNumber: string;
  legalName: string;
  tradeName: string;
  additionalTradeName?: string;
  frequency: "quarterly" | "monthly";
  gstType: "composition" | "regular";
}

interface IIncomeTaxProfile {
  pan: string;
  password: string;
  aadharRegisteredMobile: string;
  bankDetails: IBankDetails;
}

interface IUser extends mongoose.Document {
  // Basic details
  email?: string;
  password?: string;
  fullName?: string;
  alternativePhone: string;
  fathersName: string;
  phoneNumber: string;
  aadharNumber: number;
  panNumber: string;
  dateOfBirth: Date;
  state?: string;
  address?: string;
  profilePictureUrl?: string;

  // Role and metadata
  role: "user" | "admin" | "employee";
  registrationDate: Date;
  lastLogin?: Date;

  // GST Profile
  gstProfile?: IGSTProfile;

  // Income Tax Profile
  incomeTaxProfile?: IIncomeTaxProfile;
}

interface UserModel extends mongoose.Model<IUser> {}
export { UserModel, IUser };
