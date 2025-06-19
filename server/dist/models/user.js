"use strict";
/**
 * @file user.ts
 * @brief Mongoose model for users.
 *
 * Defines the structure for user documents, including address subdocuments and password hashing middleware.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
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
const AddressSchema = new mongoose_1.Schema({
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
    number: { type: String, required: true }
}, { _id: false });
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
const UserSchema = new mongoose_1.Schema({
    _id: { type: String },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["client", "admin"], default: "client" },
    phone: { type: String, required: true },
    address: { type: AddressSchema, required: true }
}, { timestamps: true });
/**
 * @brief Middleware to hash the password before saving if it was modified.
 */
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
/**
 * @brief Exports the User model.
 */
exports.default = (0, mongoose_1.model)("User", UserSchema);
