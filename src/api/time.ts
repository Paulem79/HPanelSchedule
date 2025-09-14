import {getIp} from "./ip.ts";

interface TimeApiResponse {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    seconds: number;
    milliSeconds: number;
    dateTime: string;
    date: string;
    time: string;
    timeZone: string;
    dayOfWeek: string;
    dstActive: boolean;
}

export async function getCurrentTime() {
    const res = await getAPIResponse();
    return new Date(res.dateTime);
}

async function getAPIResponse(): Promise<TimeApiResponse> {
    const res = await fetch(`https://timeapi.io/api/time/current/ip?ipAddress=${await getIp()}`);
    return await res.json();
}