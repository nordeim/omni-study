import { makeItemRoutes } from "@/lib/server/http";
import { timetableDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(timetableDelegate);
