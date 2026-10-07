import { makeCollectionRoutes } from "@/lib/server/http";
import { taskListsDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(taskListsDelegate);
