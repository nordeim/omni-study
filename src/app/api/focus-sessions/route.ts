import { makeCollectionRoutes } from "@/lib/server/http";
import { focusSessionsDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(focusSessionsDelegate);
