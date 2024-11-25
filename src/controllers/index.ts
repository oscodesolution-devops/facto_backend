import * as authController from "@/controllers/auth.controller"
import * as userController from "@/controllers/user.controller"
import * as adminController from "@/controllers/admin.controller"
import * as notificationController from "@/controllers/notification.controller"
import * as serviceController from "@/controllers/service.controller"
import * as subServiceController from "@/controllers/subService.controller"
import * as subServiceRequirementController from "@/controllers/subServiceRequirement.controller"
export const controllers = {
    authController,
    userController,
    adminController,
    notificationController,
    serviceController,
    subServiceController,
    subServiceRequirementController
}