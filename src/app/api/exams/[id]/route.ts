import { makeItemRoutes } from "@/lib/server/http";
import { examsDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(examsDelegate);
