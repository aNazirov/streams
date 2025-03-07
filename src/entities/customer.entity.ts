import { ObjectId } from "mongodb";
import { Types } from "../types";
import { Utils } from "../utils";

class Address {
  city: string;
  state: string;
  line1: string;
  line2: string;
  country: string;
  postcode: string;

  constructor(data: Types.Address) {
    this.validate(data);

    this.line1 = data.line1.trim();
    this.line2 = data.line2?.trim();
    this.postcode = data.postcode.trim();
    this.city = data.city.trim();
    this.state = data.state.trim();
    this.country = data.country.trim().toUpperCase();
  }

  getAnonymised(): Types.Address {
    const data: Types.Address = {
      city: this.city,
      state: this.state,
      country: this.country,
      line1: Utils.determineData(this.line1),
      line2: Utils.determineData(this.line2),
      postcode: Utils.determineData(this.postcode),
    };

    return data;
  }

  private validate(data: Types.Address) {
    if (typeof data.line1 !== "string" || data.line1.trim().length === 0) {
      throw new Error("Address line1 must be a non-empty string");
    }

    if (data.line2 && typeof data.line2 !== "string") {
      throw new Error("Address line2 must be a string if provided");
    }

    if (
      typeof data.postcode !== "string" ||
      data.postcode.trim().length === 0
    ) {
      throw new Error("Postcode must be a non-empty string");
    }

    if (typeof data.city !== "string" || data.city.trim().length === 0) {
      throw new Error("City must be a non-empty string");
    }

    if (typeof data.state !== "string" || data.state.trim().length === 0) {
      throw new Error("State must be a non-empty string");
    }

    if (typeof data.country !== "string" || data.country.trim().length === 0) {
      throw new Error("Country is required, must be a non-empty string");
    }
  }
}

type CustomerDTO = Omit<Types.Customer, "_id" | "createdAt"> & {
  _id?: ObjectId;
  createdAt?: Date;
  resumeToken?: string;
};

export class Customer {
  _id: ObjectId;
  email: string;
  createdAt: Date;
  lastName: string;
  firstName: string;

  address: Address;

  constructor(data: CustomerDTO) {
    this.validate(data);

    this._id = data._id ?? new ObjectId();
    this.createdAt = data.createdAt ?? new Date();

    this.firstName = data.firstName.trim();
    this.lastName = data.lastName.trim();
    this.email = data.email.toLowerCase().trim();
    this.address = new Address(data.address);
  }

  getAnonymised(): Types.Customer {
    const [emailBody, emailProvider] = this.email.split("@");
    const determinedEmailBody = Utils.determineData(emailBody);
    const determinedEmail = `${determinedEmailBody}@${emailProvider}`;

    const data: Types.Customer = {
      _id: this._id,
      email: determinedEmail,
      createdAt: this.createdAt,
      address: this.address.getAnonymised(),
      firstName: Utils.determineData(this.firstName),
      lastName: Utils.determineData(this.lastName),
    };

    return data;
  }

  private validate(data: CustomerDTO) {
    if (
      typeof data.firstName !== "string" ||
      data.firstName.trim().length === 0
    ) {
      throw new Error("First name must be a non-empty string");
    }

    if (
      typeof data.lastName !== "string" ||
      data.lastName.trim().length === 0
    ) {
      throw new Error("Last name must be a non-empty string");
    }

    if (typeof data.email !== "string" || !/^\S+@\S+\.\S+$/.test(data.email)) {
      throw new Error("Valid email is required");
    }

    if (!data.address || typeof data.address !== "object") {
      throw new Error("Address is required");
    }
  }
}
