import { IArticle } from "@types";

const processArticlesData = (articles: IArticle[]): IArticle[] =>
  articles
    .map((article) => ({
      ...article.toObject(),
      body:
        article.body.slice(0, 100) + (article.body.length > 100 ? "..." : ""),
    }))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

export default processArticlesData;
