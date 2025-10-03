export type User = {
  _id: string;
  email: string;
  password: string;
  refresh_token?: string;
  createdAt: Date;
  updatedAt: Date;
};
