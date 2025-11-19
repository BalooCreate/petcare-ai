import { handle } from "react-router-hono-server/worker";
import { build } from "../build/server";

export default {
  fetch: handle(build)
};
