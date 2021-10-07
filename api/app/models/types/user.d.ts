import { Document, Model } from 'mongoose'
import {IAuthorModel, ITimestampModel} from "./types";

interface User extends Document, ITimestampModel, IAuthorModel {
    name: string;
    email: string;
    password: string
    image: string;
    role: string;
    createdBy: string;
    updatedBy: string;

    comparePassword(password: string): Promise<boolean>
}

interface UserModel extends Model<User> {

}

declare const user: UserModel;

export = user;