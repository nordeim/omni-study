import { makeItemRoutes } from "@/lib/server/http";
import { gradesDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(gradesDelegate);
