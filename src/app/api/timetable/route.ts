import { makeCollectionRoutes } from "@/lib/server/http";
import { timetableDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(timetableDelegate);
