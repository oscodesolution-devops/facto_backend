import { createOrder, verifyRazorpayPayment, verifyWebhookSignature, } from "@/config/razorpay";
import { StatusCode } from "@/constants/constants";
import { createCustomError } from "@/errors/customAPIError";
import bigPromise from "@/middlewares/bigPromise";
import { sendSuccessApiResponse } from "@/middlewares/successApiResponse";
import { db } from "@/models";
import { NextFunction, Request, Response } from "express";

export const initiatePayment = bigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, items, currency = "INR"} = req.body;

      if (!userId || !items || items.length === 0 ) {
        return next(
            createCustomError("Invalid request body", StatusCode.BAD_REQ)
          );
      }

      // Calculate total amount
      const amount = items.reduce(
        (total: number, item: any) => total + item.price,
        0
      );

      // Create Razorpay order
      const razorpayOrder = await createOrder(amount, currency, userId);

      // Create PaymentOrder in our database
      const paymentOrder = new db.PaymentOrder({
        userId,
        amount,
        currency,
        items,
        status: "pending",
        paymentMethod: "razorpay",
        transactionId: razorpayOrder.id,
      });

      await paymentOrder.save();
      console.log(paymentOrder)
      const response = sendSuccessApiResponse("Order initiated Successfully",{
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentOrderId: paymentOrder._id,
      },200);
      res.send(response);
    } catch (error) {
      console.error("Error initiating payment:", error);
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  }
);

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
      const isValid = await verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  
      if (!isValid) {
        return next(
            createCustomError('Invalid payment signature', StatusCode.BAD_REQ)
          );
      }
  
      // Update PaymentOrder status
      const paymentOrder = await db.PaymentOrder.findOneAndUpdate(
        { transactionId: razorpay_order_id },
        { status: 'completed' },
        { new: true }
      );
  
      if (!paymentOrder) {
        return next(
            createCustomError('Payment order not found', StatusCode.NOT_FOUND)
          );
      }
  
      // Create UserPurchase records
      const userPurchases = await Promise.all(
        paymentOrder.items.map(async (item) => {
          const purchase = new db.UserPurchase({
            userId: paymentOrder.userId,
            itemType: item.itemType,
            itemId: item.itemId,
            selectedFeatures: item.selectedFeatures,
            billingPeriod: item.billingPeriod,
            paymentOrderId: paymentOrder._id,
            status: 'active',
          });
  
          // Set expiry date for services
        //   if (item.itemType === 'service') {
        //     const SubService = mongoose.model('SubService');
        //     const service = await SubService.findById(item.itemId);
        //     if (service) {
        //       const now = new Date();
        //       switch (service.period) {
        //         case 'monthly':
        //           purchase.expiryDate = new Date(now.setMonth(now.getMonth() + 1));
        //           break;
        //         case 'quarterly':
        //           purchase.expiryDate = new Date(now.setMonth(now.getMonth() + 3));
        //           break;
        //         case 'half_yearly':
        //           purchase.expiryDate = new Date(now.setMonth(now.getMonth() + 6));
        //           break;
        //         case 'yearly':
        //           purchase.expiryDate = new Date(now.setFullYear(now.getFullYear() + 1));
        //           break;
        //         // For one_time, expiryDate remains undefined
        //       }
        //     }
        //   }
  
          return purchase.save();
        })
      );
      console.log(userPurchases);
      const response = sendSuccessApiResponse("Payment verified and purchases recorded",{paymentOrderId: paymentOrder._id,userPurchases: userPurchases},200)
  
      res.send(response);
    } catch (error) {
      console.error('Error verifying payment:', error);
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  };
  
  export const handleWebhook = async (req: Request, res: Response,next:NextFunction) => {
    try {
      const rawBody = JSON.stringify(req.body);
      const signature = req.headers['x-razorpay-signature'] as string;
      const isValid = verifyWebhookSignature(rawBody, signature);
  
      if (!isValid) {
        return next(
            createCustomError('Invalid webhook signature', StatusCode.BAD_REQ)
          );
      }
  
      const event = req.body.event;
  
      switch (event) {
        case 'payment.captured':
          await handlePaymentCaptured(req.body.payload.payment.entity);
          break;
        case 'payment.failed':
          await handlePaymentFailed(req.body.payload.payment.entity);
          break;
        // Add more event handlers as needed
      }
  
      res.json({ status: 'ok' });
    } catch (error) {
      console.error('Webhook handling error:', error);
      next(createCustomError(error.message, StatusCode.INT_SER_ERR));
    }
  };
  
  async function handlePaymentCaptured(payment: any) {
    const paymentOrder = await db.PaymentOrder.findOneAndUpdate(
      { transactionId: payment.order_id },
      { status: 'completed' },
      { new: true }
    );
  
    if (!paymentOrder) {
      console.error('Payment order not found for order_id:', payment.order_id);
      return;
    }
  
    // Create UserPurchase records
    await Promise.all(
      paymentOrder.items.map(async (item) => {
        const purchase = new db.UserPurchase({
          userId: paymentOrder.userId,
          itemType: item.itemType,
          itemId: item.itemId,
          paymentOrderId: paymentOrder._id,
          status: 'active',
        });
  
        // Set expiry date for services
        // if (item.itemType === 'service') {
        //   const SubService = mongoose.model('SubService');
        //   const service = await SubService.findById(item.itemId);
        //   if (service) {
        //     const now = new Date();
        //     switch (service.period) {
        //       case 'monthly':
        //         purchase.expiryDate = new Date(now.setMonth(now.getMonth() + 1));
        //         break;
        //       case 'quarterly':
        //         purchase.expiryDate = new Date(now.setMonth(now.getMonth() + 3));
        //         break;
        //       case 'half_yearly':
        //         purchase.expiryDate = new Date(now.setMonth(now.getMonth() + 6));
        //         break;
        //       case 'yearly':
        //         purchase.expiryDate = new Date(now.setFullYear(now.getFullYear() + 1));
        //         break;
        //       // For one_time, expiryDate remains undefined
        //     }
        //   }
        // }
  
        await purchase.save();
      })
    );
  }
  
  async function handlePaymentFailed(payment: any) {
    await db.PaymentOrder.findOneAndUpdate(
      { transactionId: payment.order_id },
      { status: 'failed' }
    );
    // Implement any additional logic for failed payments (e.g., notifying the user)
  }
  
  