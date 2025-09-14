import NodeCache from "npm:node-cache";

const cachedVacances = new NodeCache({stdTTL: 60 * 60 * 12, checkperiod: 60 * 60 * 6});

export interface Vacances {
    description: string;
    population: string;
    start_date: string;
    end_date: string;
    location: string;
    zones: string;
    annee_scolaire: string;
}

function getApiUrl(year: number) {
    return `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-calendrier-scolaire/exports/json?lang=fr&refine=population%3A%22-%22&refine=annee_scolaire%3A%22${year}-${year + 1}%22&refine=location%3A%22Poitiers%22&facet=facet(name%3D%22population%22%2C%20disjunctive%3Dtrue)&facet=facet(name%3D%22location%22%2C%20disjunctive%3Dtrue)&facet=facet(name%3D%22annee_scolaire%22%2C%20disjunctive%3Dtrue)&timezone=Europe%2FParis`;
}

export async function getApiData(year: number) {
    const response = await fetch(getApiUrl(year));
    const json = await response.json();
    return json as Vacances[];
}

async function getVacances(date: Date): Promise<Vacances[]> {
    const year = date.getFullYear();

    if (cachedVacances.has(year)) {
        return cachedVacances.get(year)!;
    }

    let data = await getApiData(year);
    while (data.length == 0) {
        data = await getApiData(year - 1);
    }

    cachedVacances.set(year, data);
    console.log(`Cache mis à jour pour l'année ${year}.`);

    return data;
}

export async function isInVacances(date: Date) {
    for (const v of await getVacances(date)) {
        const debut = new Date(v.start_date);
        const fin = new Date(v.end_date);

        if (date >= debut && date < fin) return true;
    }

    return false;
}