import { makeCollectionRoutes } from "@/lib/server/http";
import { holidaysDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(holidaysDelegate);
