import { makeItemRoutes } from "@/lib/server/http";
import { subjectsDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(subjectsDelegate);
