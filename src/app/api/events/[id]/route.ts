import { makeItemRoutes } from "@/lib/server/http";
import { eventsDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(eventsDelegate);
