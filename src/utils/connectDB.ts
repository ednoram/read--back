import { connect, connection } from "mongoose";

import { MONGO_URI } from "@config";

const connectDB = (): void => {
  connect(MONGO_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  connection.once("open", () => {
    console.log("Connected to DB");
  });
};

export default connectDB;
