import { publicIpv4 } from 'npm:public-ip';

export async function getIp(): Promise<string> {
    return publicIpv4();
}