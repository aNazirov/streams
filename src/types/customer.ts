import { ObjectId } from "mongodb";

export type Address = {
  line1: string;
  line2: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
};

export type Customer = {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  resumeToken?: string;
  address: Address;
  createdAt: Date;
};
