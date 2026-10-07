import { makeCollectionRoutes } from "@/lib/server/http";
import { tasksDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(tasksDelegate);
