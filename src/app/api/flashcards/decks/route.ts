import { makeCollectionRoutes } from "@/lib/server/http";
import { decksDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(decksDelegate);
