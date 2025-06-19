/**
 * @file user.ts
 * @brief Mongoose model for users.
 *
 * Defines the structure for user documents, including address subdocuments and password hashing middleware.
 */

import { Schema, model, Document, CallbackError } from "mongoose";
import bcrypt from "bcrypt";

/**
 * @interface IAddress
 * @brief Interface for address subdocument.
 *
 * @property country User's country.
 * @property state   User's state.
 * @property city    User's city.
 * @property street  User's street.
 * @property number  User's street number.
 */
interface IAddress {
  country: string;
  state: string;
  city: string;
  street: string;
  number: string;
}

/**
 * @interface IUser
 * @brief Interface for the user document.
 *
 * @property _id      Unique user identifier.
 * @property fullName User's full name.
 * @property email    User's email address.
 * @property password User's password (hashed).
 * @property role     User's role, either "client" or "admin".
 * @property phone    User's phone number.
 * @property address  User's address (IAddress).
 */
interface IUser extends Document {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  role: "client" | "admin";
  phone: string;
  address: IAddress;
}

/**
 * @brief Mongoose schema for the address subdocument.
 *
 * Fields:
 * - country: String, required.
 * - state: String, required.
 * - city: String, required.
 * - street: String, required.
 * - number: String, required.
 *
 * _id is disabled for this subdocument.
 */
const AddressSchema = new Schema<IAddress>(
  {
    country: { type: String, required: true },
    state:   { type: String, required: true },
    city:    { type: String, required: true },
    street:  { type: String, required: true },
    number:  { type: String, required: true }
  },
  { _id: false }
);

/**
 * @brief Mongoose schema for the User model.
 *
 * Fields:
 * - _id: String.
 * - fullName: String, required.
 * - email: String, required, unique.
 * - password: String, required (will be hashed).
 * - role: String, enum "client" or "admin", default "client".
 * - phone: String, required.
 * - address: AddressSchema, required.
 *
 * Includes automatic createdAt/updatedAt timestamps.
 */
const UserSchema = new Schema<IUser>(
  {
    _id:      { type: String },
    fullName: { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ["client", "admin"], default: "client" },
    phone:    { type: String, required: true },
    address:  { type: AddressSchema, required: true }
  },
  { timestamps: true }
);

/**
 * @brief Middleware to hash the password before saving if it was modified.
 */
UserSchema.pre<IUser>("save", function (next) {
  if (!this.isModified("password")) return next();
  bcrypt
    .hash(this.password, 10)
    .then((hash: string) => {
      this.password = hash;
      next();
    })
    .catch((err: CallbackError) => {
      next(err);
    });
});

/**
 * @brief Exports the User model.
 */
export default model<IUser>("User", UserSchema);
