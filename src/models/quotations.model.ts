import { IQuotation, QuotationModel } from "@/interfaces";
import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema<IQuotation, QuotationModel>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubService",
    required: true,
  },
  selectedFeatures:[{
    name: String
  }],
  price:{
    type:Number,
  }
});

const Quotation = mongoose.model<IQuotation,QuotationModel>(
    "Quotation",
    quotationSchema,
    "quotation"
);

export default Quotation;
