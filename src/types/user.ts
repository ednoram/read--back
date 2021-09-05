interface IUser {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  isVerified: boolean;
}

export default IUser;
