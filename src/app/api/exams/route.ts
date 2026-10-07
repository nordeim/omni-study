import { makeCollectionRoutes } from "@/lib/server/http";
import { examsDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(examsDelegate);
