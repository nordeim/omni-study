import { makeItemRoutes } from "@/lib/server/http";
import { practiceTestsDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(practiceTestsDelegate);
