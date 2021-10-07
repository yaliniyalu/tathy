import {RequestHandler} from "express";

declare global {
    type ExpressRequestHandler = RequestHandler;
}
