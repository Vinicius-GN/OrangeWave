import { Schema, model, Document, CallbackError } from "mongoose";
import bcrypt from "bcrypt";

interface IAddress {
  country: string;
  state: string;
  city: string;
  street: string;
  number: string;
}

interface IUser extends Document {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  role: "client" | "admin";
  phone: string;
  address: IAddress;
}

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

// Antes de salvar, hash na senha se ela tiver sido modificada
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

export default model<IUser>("User", UserSchema);
