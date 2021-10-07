import { Document, Model } from 'mongoose'
import * as Item from './item'
import {IAuthorModel, ITimestampModel} from "./types";
import * as User from "./user";


interface Pack extends Document, ITimestampModel, IAuthorModel {
    name: string;
    description: string;
    image: string
    tags: Array<string>;
    items: Array<string | typeof Item>
    isActive: boolean;

    purchase: {
        amount: number;
        sku: string;
    }

    status: string;
    statusChangedBy: string|typeof User;
    statusChangedAt: number|Date;

    addItem(item: string | typeof Item): void;
    isEnabled(): boolean
}

interface PackModel extends Model<Pack> {

}

declare const pack: PackModel;
export = pack;
