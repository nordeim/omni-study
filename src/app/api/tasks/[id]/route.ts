import { makeItemRoutes } from "@/lib/server/http";
import { tasksDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(tasksDelegate);
