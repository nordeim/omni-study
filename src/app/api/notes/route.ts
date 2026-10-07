import { makeCollectionRoutes } from "@/lib/server/http";
import { notesDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(notesDelegate);
