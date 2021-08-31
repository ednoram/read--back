import { ILike } from "@types";

interface IArticle {
  _id: string;
  body: string;
  title: string;
  likes?: ILike[];
  createdAt: Date;
  updatedAt: Date;
  isLiked?: boolean;
  isSaved?: boolean;
  userEmail: string;
  toObject: () => IArticle;
}

export default IArticle;
