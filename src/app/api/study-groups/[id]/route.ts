import { makeItemRoutes } from "@/lib/server/http";
import { studyGroupsDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(studyGroupsDelegate);
