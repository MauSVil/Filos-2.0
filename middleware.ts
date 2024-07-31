import {
  stackMiddlewares
} from "@/middlewares/stackHandler";
import {
  frontAuth
} from "@/middlewares/frontAuth";

const middlewares = [frontAuth];
export default stackMiddlewares(middlewares);