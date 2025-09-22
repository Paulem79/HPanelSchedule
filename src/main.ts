import HetznerCloud, {Server} from './types/hcloud.ts';
import {isInVacances} from "./api/calendrier.ts";
import {getCurrentTime} from "./api/time.ts";
import {sleep} from "./api/sleep.ts";

// Ajout de la redirection des logs vers log.txt
const logFilePath = './log.txt';

async function writeLog(message: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message + '\n');
    await Deno.writeFile(logFilePath, data, { append: true });
}

const originalLog = console.log;
console.log = (...args: unknown[]) => {
    const msg = args.map(String).join(' ');
    originalLog(msg); // Affiche dans la console
    writeLog(msg).catch((e) => {
        originalLog('[LOG ERROR]', e);
    }); // Écrit dans log.txt
};

const originalError = console.error;
console.error = (...args: unknown[]) => {
    const msg = args.map(String).join(' ');
    originalError(msg); // Affiche dans la console
    writeLog('[ERROR] ' + msg).catch((e) => {
        originalError('[LOG ERROR]', e);
    }); // Écrit dans log.txt
};

const SERVER_ID = parseInt(Deno.env.get("SERVER_ID")!);

if (!Deno.env.get("TOKEN")) {
    console.error("Veuillez définir la variable d'environnement TOKEN avec votre token Hetzner Cloud.");
    Deno.exit(1);
}

if (!Deno.env.get("SERVER_ID")) {
    console.error("Veuillez définir la variable d'environnement SERVER_ID avec l'ID de votre serveur Hetzner Cloud.");
    Deno.exit(1);
}

function isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = dimanche, 6 = samedi
}

function isTomorrowWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 5 || day === 6; // 5 = vendredi, 6 = samedi
}

async function checkAndUpdateServer(client: HetznerCloud.Client) {
    const server: Server = await client.servers.get(SERVER_ID);

    const now = getCurrentTime();
    const heure = now.getHours() + now.getMinutes() / 60;
    const weekend = isWeekend(now);
    const mercredi = now.getDay() === 3;
    const vacances = await isInVacances(now);

    console.log(`Nous sommes ${weekend ? "le weekend" : "la semaine"} et nous sommes en ${vacances ? "vacances" : "période scolaire"}. L'heure actuelle est de ${heure.toFixed(2)} heures.`)

    let doitEtreAllume = true;

    if (heure >= 3 && heure < 8) {
        doitEtreAllume = false;
    } else if (!weekend && !vacances) {
        // Semaine, période scolaire
        // Si mercredi -> 11h sinon 16.5h
        if (!isTomorrowWeekend(now) && ((heure >= 21 && heure < 24) || (heure >= 0 && heure < (mercredi ? 11 : 16.5)))) {
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
        } catch (e: Error) {
            console.error("Erreur lors de la vérification du serveur :", e.stack);
        }

        await sleep(60 * 1000);
    }
}

await main();