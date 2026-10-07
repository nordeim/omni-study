import { makeCollectionRoutes } from "@/lib/server/http";
import { studyGroupsDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(studyGroupsDelegate);
