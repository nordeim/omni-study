import { makeItemRoutes } from "@/lib/server/http";
import { decksDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(decksDelegate);
