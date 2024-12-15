import Notification from "@/models/notification.model";
import User from "./user.model";
import Service from "@/models/service.model";
import SubService from "@/models/subService.model";
import SubServiceRequirement from "@/models/subServiceRequirement.model";
import UserDocument from "@/models/userDocument.model";
import Lecture from "@/models/lecture.model";
import Course from "@/models/course.model";
import Blog from "@/models/blog.model";
import Query from "@/models/query.model";
import Request from "@/models/request.model";
import PaymentOrder from "@/models/paymentOrder.model";
import UserPurchase from "@/models/userPurchase.model";
import Quotation from "@/models/quotations.model";
import Application from "@/models/application.model";

export const db = {
  User,
  Notification,
  Service,
  SubService,
  SubServiceRequirement,
  UserDocument,
  Lecture,
  Course,
  Blog,
  Query,
  Request,
  PaymentOrder,
  UserPurchase,
  Quotation,
  Application,
};
