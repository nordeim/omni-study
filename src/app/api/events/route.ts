import { makeCollectionRoutes } from "@/lib/server/http";
import { eventsDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(eventsDelegate);
