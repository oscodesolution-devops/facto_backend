import mongoose from "mongoose";
interface IRequests {
    name: string;
}
interface IQuotation {
    userId: mongoose.Types.ObjectId;
    subServiceId: mongoose.Types.ObjectId;
    selectedFeatures: IRequests[];
    price: number;
}

interface QuotationModel extends mongoose.Model<IQuotation> {}

export {QuotationModel, IQuotation};