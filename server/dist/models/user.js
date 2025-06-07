"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const AddressSchema = new mongoose_1.Schema({
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
    number: { type: String, required: true }
}, { _id: false });
const UserSchema = new mongoose_1.Schema({
    _id: { type: String },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["client", "admin"], default: "client" },
    phone: { type: String, required: true },
    address: { type: AddressSchema, required: true }
}, { timestamps: true });
// Antes de salvar, hash na senha se ela tiver sido modificada
UserSchema.pre("save", function (next) {
    if (!this.isModified("password"))
        return next();
    bcrypt_1.default
        .hash(this.password, 10)
        .then((hash) => {
        this.password = hash;
        next();
    })
        .catch((err) => {
        next(err);
    });
});
exports.default = (0, mongoose_1.model)("User", UserSchema);
