import { makeItemRoutes } from "@/lib/server/http";
import { assignmentsDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(assignmentsDelegate);
