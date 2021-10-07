import { Document, Model } from 'mongoose'

interface Otp extends Document {
    email: String
    type: String
    code: Number
    retryCount: Number
    lastRetryAt: Number
    expiresOn: Number
}

interface OtpModel extends Model<Otp> {
    generateOtp: (email: String, type: String) => Promise<Otp>
    verifyOtp: (email: String, type: String, code: Number) => Promise<string|null>
}

declare const otp: OtpModel;

export = otp;