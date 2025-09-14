import * as assert from "jsr:@std/assert";
import {getApiData} from "../api/calendrier.ts";

Deno.test({
    name: "request_api",
    permissions: { net: true },
    fn: async () => {
        const data = await getApiData(new Date().getFullYear());
        assert.assertGreaterOrEqual(data.length, 1);
    }
});
