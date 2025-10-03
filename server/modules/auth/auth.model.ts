import mongoose, { Schema } from "mongoose";
import { User } from "./auth.types";

const UserSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: false },
    refresh_token: { type: String, required: false },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<User>("User", UserSchema);

export default UserModel;
