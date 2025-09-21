import {getIp} from "./ip.ts";

interface TimeApiResponse {
    year: number;
    month: number;
    monthName: string;
    day: number;
    dayofweek: number;
    dayofweekName: string;
    hours: number;
    minutes: number;
    seconds: number;
    millis: number;
    fulldate: string;
    timezone: string;
    status: string;
}

export async function getCurrentTime() {
    const res = await getAPIResponse();
    return new Date(res.fulldate);
}

async function getAPIResponse(): Promise<TimeApiResponse> {
    const res = await fetch(`https://script.google.com/macros/s/AKfycbyd5AcbAnWi2Yn0xhFRbyzS4qMq1VucMVgVvhul5XqS9HkAyJY/exec?tz=Europe/Paris`);
    return await res.json();
}