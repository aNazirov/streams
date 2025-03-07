import { config } from "dotenv";

config();

const DB_URI = process.env.DB_URI ?? "";
const DB_NAME = "fundraise_up";
const CustomerCollection = "customers";
const CustomerAnonymisedCollection = "customers_anonymised";
const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const BATCH_LIMIT = 1000;
const REINDEX_FLAG = "--full-reindex";
const ReadableStreamEvents = ["close", "end", "error", "pause", "resume"];
const ReadWriteStreamEvents = [
  "close",
  "finish",
  "pipe",
  "unpipe",
  "end",
  "error",
  "pause",
  "resume",
];
const WritableStreamEvents = [
  "close",
  "drain",
  "finish",
  "pipe",
  "unpipe",
  "error",
];

const Constants = {
  DB_URI,
  DB_NAME,
  CustomerCollection,
  CustomerAnonymisedCollection,
  ALPHABET,
  BATCH_LIMIT,
  REINDEX_FLAG,
  ReadableStreamEvents,
  ReadWriteStreamEvents,
  WritableStreamEvents,
} as const;

export default Constants;
