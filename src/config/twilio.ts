import twilio from "twilio";
import { configDotenv } from "dotenv";
configDotenv()
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || "", // Your Twilio Account SID
  authToken: process.env.TWILIO_AUTH_TOKEN || "", // Your Twilio Auth Token
  serviceSid: process.env.TWILIO_SERVICE_SID || "", // Your Twilio Verify Service SID
};
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN);
console.log('TWILIO_SERVICE_SID:', process.env.TWILIO_SERVICE_SID);


const client = twilio(twilioConfig.accountSid, twilioConfig.authToken);

/**
 * Sends an OTP to the provided phone number.
 * @param phoneNumber - The phone number to send the OTP to (E.164 format).
 * @returns A Promise indicating the success or failure of the OTP send operation.
 */
export const sendOTP = async (phoneNumber: string): Promise<any> => {
  try {
    const verification = await client.verify.v2
      .services(twilioConfig.serviceSid)
      .verifications.create({ to: phoneNumber, channel: "sms" });

    return { success:true };
  } catch (error) {
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

export const verifyOTP = async (
  phoneNumber: string,
  otp: string
): Promise<string> => {
  try {
    const verificationCheck = await client.verify.v2
      .services(twilioConfig.serviceSid)
      .verificationChecks.create({ to: phoneNumber, code: otp });

    if (verificationCheck.status === "approved") {
      return "approved"
    } else {
      throw new Error(`Invalid OTP. Status: ${verificationCheck.status}`);
    }
  } catch (error) {
    throw new Error(`Failed to verify OTP: ${error.message}`);
  }
};
