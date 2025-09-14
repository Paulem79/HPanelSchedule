import * as assert from "jsr:@std/assert";
import {getApiData} from "../api/calendrier.ts";
import {getCurrentTime} from "../api/time.ts";

Deno.test({
    name: "request_calendar_api",
    permissions: { net: true },
    fn: async () => {
        const data = await getApiData(new Date().getFullYear());
        assert.assertGreaterOrEqual(data.length, 1);
    }
});

Deno.test({
    name: "request_time_api",
    permissions: { net: true },
    fn: async () => {
        const currentDate = await getCurrentTime();
        assert.assertExists(currentDate);
    }
});
