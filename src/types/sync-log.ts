import { ObjectId } from "mongodb";

export type SyncLog = {
  _id: ObjectId;
  token: string;
  createdAt: Date;
};
