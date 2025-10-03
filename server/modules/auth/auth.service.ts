import UserModel from "./auth.model";

export function getOneByEmail(email: string) {
  return UserModel.findOne({ email });
}

export function getOneById(userId: string) {
  return UserModel.findOne({ _id: userId });
}

export function updateRefreshToken(userId: string, refreshToken?: string) {
  return UserModel.findByIdAndUpdate(userId, { refresh_token: refreshToken });
}

export function createUser(email: string, password: string) {
  return new UserModel({ email, password }).save();
}
