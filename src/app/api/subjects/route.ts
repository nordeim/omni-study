import { makeCollectionRoutes } from "@/lib/server/http";
import { subjectsDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(subjectsDelegate);
