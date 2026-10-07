import { makeCollectionRoutes } from "@/lib/server/http";
import { notebooksDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(notebooksDelegate);
