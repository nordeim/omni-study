import { makeCollectionRoutes } from "@/lib/server/http";
import { practiceTestsDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(practiceTestsDelegate);
