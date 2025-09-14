import HetznerCloud, {Server} from './types/hcloud.ts';
import {DateTime} from 'npm:luxon';
import {isInVacances} from "./api/calendrier.ts";

const SERVER_ID = parseInt(Deno.env.get("SERVER_ID")!);

if (!Deno.env.get("TOKEN")) {
    console.error("Veuillez définir la variable d'environnement TOKEN avec votre token Hetzner Cloud.");
    Deno.exit(1);
}

if (!Deno.env.get("SERVER_ID")) {
    console.error("Veuillez définir la variable d'environnement SERVER_ID avec l'ID de votre serveur Hetzner Cloud.");
    Deno.exit(1);
}

function isTomorrowWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 5 || day === 6; // 5 = vendredi, 6 = samedi
}

// Récupérer l'heure actuelle à Paris
function getParisDate(): Date {
    return DateTime.now()
        .setZone('Europe/Paris')
        .toJSDate();
}

async function checkAndUpdateServer(client: HetznerCloud.Client) {
    const server: Server = await client.servers.get(SERVER_ID);

    const now = getParisDate();
    const heure = now.getHours() + now.getMinutes() / 60;
    const weekend = isTomorrowWeekend(now);
    const vacances = await isInVacances(now);

    console.log(`Nous sommes ${weekend ? "le weekend demain" : "la semaine"} et nous sommes en ${vacances ? "vacances" : "période scolaire"}. L'heure actuelle est de ${heure.toFixed(2)} heures.`)

    let doitEtreAllume = true;

    if (heure >= 3 && heure < 8) {
        doitEtreAllume = false;
    } else if (!weekend && !vacances) {
        // Semaine, période scolaire
        if ((heure >= 21 && heure < 24) || (heure >= 0 && heure < 16.5)) {
            doitEtreAllume = false;
        }
    }

    const powerStatus = server.status;

    if (doitEtreAllume && powerStatus !== 'running') {
        console.log("Allumage du serveur...");
        await server.powerOn();
    } else if (!doitEtreAllume && powerStatus !== 'off') {
        console.log("Arrêt du serveur...");
        await server.shutdown();
    } else {
        console.log(`Aucune action nécessaire. Statut actuel : ${powerStatus}`);
    }
}

async function main() {
    let client = new HetznerCloud.Client(Deno.env.get("TOKEN")!);

    while (true) {
        try {
            await checkAndUpdateServer(client);
        } catch (e) {
            console.error("Erreur lors de la vérification du serveur :", e);
            break;
        }
        await new Promise((resolve) => setTimeout(resolve, 60000)); // 1 minute
    }
}

await main();