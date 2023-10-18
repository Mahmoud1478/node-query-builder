import express, { Application } from "express";

import Cors from "cors";
import routes from "./routes";
import { env } from "./helpers";

const corsOption = {
    // origin: ["http://localhost:5173", "http://storefrontfront.s3-website-us-east-1.amazonaws.com"],
    origin: ["*"],
};
const App: Application = express();
const port = env("PORT", "3000");

App.listen(port, (): void => {
    console.log(`\nApplication started in http://localhost:${port}`);
});

App.use(express.json());

App.use(Cors(corsOption));

App.use("/", routes);

export default App;
