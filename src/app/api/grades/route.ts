import { makeCollectionRoutes } from "@/lib/server/http";
import { gradesDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(gradesDelegate);
