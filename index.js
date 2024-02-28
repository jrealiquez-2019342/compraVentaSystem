import { initServer } from "./configs/app.js";
import { connect } from "./configs/mongo.js";
import { createAdmin } from "./src/user/user.controller.js";

initServer();
connect();
createAdmin();