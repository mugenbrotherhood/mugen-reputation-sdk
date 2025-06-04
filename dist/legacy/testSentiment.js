"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sentiment_1 = require("../legacy/sentiment");
//                                ^ no “src/” prefix, because we’re already in src/
async function main() {
    const twitterUserId = "0xexodia";
    const score = await (0, sentiment_1.getSentimentScore)(twitterUserId);
    console.log("Sentiment score:", score);
}
main();
