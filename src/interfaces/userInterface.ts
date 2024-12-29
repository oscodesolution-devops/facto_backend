import mongoose from "mongoose";

interface IBankDetails {
  accountNumber: string;
  ifscCode: string;

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
  
  password: string;
  itrType: "ITR-1"|"ITR-2"|"ITR-3"|"ITR-4"|"ITR-5"|"ITR-6"
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
