import express, { json, urlencoded } from "express";
import { graphqlHTTP } from "express-graphql";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import schema from "@schema";
import { auth } from "@middleware";
import { connectDB } from "@utils";
import { PORT, IS_PRODUCTION } from "@config";

connectDB();

const app = express();

app.use(json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));

app.use(auth);

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: !IS_PRODUCTION,
  })
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
