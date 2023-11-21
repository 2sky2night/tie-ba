import tokenParse from "./auth/token";
import authorizationCatcher from "./auth/authorization";
import { StaticMiddleware } from "./static-m";
import { ClientMiddleware } from "./client-m";

export default {
  tokenParse,
  authorizationCatcher,
  staticMiddleware: StaticMiddleware,
  clientMiddleware: ClientMiddleware,
};
