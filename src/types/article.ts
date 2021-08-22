interface IArticle {
  _id: string;
  body: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userEmail: string;
  toObject: () => IArticle;
}

export default IArticle;
