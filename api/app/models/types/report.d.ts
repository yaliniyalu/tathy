import { Document, Model } from 'mongoose'
import * as User from './user'
import * as Item from './item'
import {ITimestampModel} from "./types";


interface Report extends Document, ITimestampModel {
    email: string;
    report: string;

    item: string|typeof Item
    status: string;
    statusChangedBy: string|typeof User;
    statusChangedAt: Date|number;
    actionTaken: string
    notes: string;
}

interface ReportModel extends Model<Report> {

}

declare const report: ReportModel;
export = report;
