import {DateTime} from "npm:luxon";

export async function getCurrentTime() {
    return new Date(DateTime.now()
        .setZone('Europe/Paris')
        .toFormat('yyyy-LL-dd HH:mm:ss')
    );
}