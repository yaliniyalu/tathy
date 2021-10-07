import * as User from "./user";

interface ITimestampModel {
    createdAt: string;
    updatedAt: string;
}

interface IAuthorModel {
    createdBy: string|typeof User;
    updatedBy: string|typeof User;

    setAuthor(string): void;
}