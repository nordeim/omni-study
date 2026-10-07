import { makeItemRoutes } from "@/lib/server/http";
import { focusSessionsDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(focusSessionsDelegate);
