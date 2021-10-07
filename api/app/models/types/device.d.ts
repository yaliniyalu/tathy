import { Document, Model } from 'mongoose'
import {ITimestampModel} from "./types";

interface Device extends Document, ITimestampModel {
    deviceId: String
    fcmId: String
}

interface DeviceModel extends Model<Device> {

}

declare const device: DeviceModel;

export = device;
