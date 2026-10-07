import { makeCollectionRoutes } from "@/lib/server/http";
import { assignmentsDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(assignmentsDelegate);
