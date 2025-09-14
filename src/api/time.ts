import {sleep} from "./sleep.ts";

export interface TimeApiResponse {
    utc_offset: string;
    timezone: string;
    day_of_week: number;
    day_of_year: number;
    datetime: string;
    utc_datetime: string;
    unixtime: number;
    raw_offset: number;
    week_number: number;
    dst: boolean;
    abbreviation: string;
    dst_offset: number;
    dst_from: string;
    dst_until: string;
    client_ip: string;
}

export async function getCurrentTime() {
    const res = await getAPIResponse();
    return new Date(res.datetime);
}

async function getAPIResponse(tryCount = 0): Promise<TimeApiResponse> {
    try {
        const res = await fetch("https://worldtimeapi.org/api/ip");
        return await res.json();
    } catch (e) {
        tryCount++;
        console.log(`Essai ${tryCount} : ${e}`);
        await sleep(500);
        return await getAPIResponse(tryCount);
    }
}