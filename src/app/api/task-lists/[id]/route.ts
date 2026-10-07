import { makeItemRoutes } from "@/lib/server/http";
import { taskListsDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(taskListsDelegate);
