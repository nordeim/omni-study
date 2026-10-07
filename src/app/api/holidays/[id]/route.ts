import { makeItemRoutes } from "@/lib/server/http";
import { holidaysDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(holidaysDelegate);
