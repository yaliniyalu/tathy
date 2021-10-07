import { Document, Model } from 'mongoose'
import * as User from './user'
import {IAuthorModel, ITimestampModel} from "./types";


interface Item extends Document, ITimestampModel, IAuthorModel {
    type: string;
    text: string;
    image: string
    tags: Array<string>;
    notes: string;
    renderedSvg: string;
    style: {
        image: string;
        imageHeight: number;
        hasSeparator: boolean;
        fontFamily: string;
        themeColor: string;
    }

    likes: number;
    views: number;

    status: string;
    statusChangedBy: string|typeof User;
    statusChangedAt: Date;
    rejectedReason: string;
    isApproved(): boolean;
}

interface ItemModel extends Model<Item> {

}

declare const item: ItemModel;
export = item;