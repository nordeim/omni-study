import { makeItemRoutes } from "@/lib/server/http";
import { notebooksDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(notebooksDelegate);
