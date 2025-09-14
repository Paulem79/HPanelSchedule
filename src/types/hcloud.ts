// Type definitions for hcloud-js (manually authored for Deno consumption)
// Source repository: dennisbruner/hcloud-js (archived)
// These typings are partial/incomplete and should be refined.

// Common utility types
interface PaginationMeta {
    pagination: {
        page: number
        per_page: number
        previous_page: number | null
        next_page: number | null
        last_page: number
        total_entries: number
    }
}

type Labels = Record<string, string>

// ===================== Errors =====================

export class APIError {
    constructor(error: { code: string; message: string; details?: any })
    code: string
    message: string
    details: any

    static FORBIDDEN: 'forbidden'
    static INVALID_INPUT: 'invalid_input'
    static JSON_ERROR: 'json_error'
    static LOCKED: 'locked'
    static NOT_FOUND: 'not_found'
    static RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded'
    static RESOURCE_LIMIT_EXCEEDED: 'resource_limit_exceeded'
    static RESOURCE_UNAVAILABLE: 'resource_unavailable'
    static SERVICE_ERROR: 'service_error'
    static UNIQUENESS_ERROR: 'uniqueness_error'
}

// ===================== Pagination Base =====================

export class Pagination {
    constructor(endpoint: any, params: any, meta: PaginationMeta)
    endpoint: any
    params: any

    page: number
    perPage: number
    previousPage: number | null
    nextPage: number | null
    lastPage: number
    totalEntries: number

    next(): Promise<any>
    previous(): Promise<any>
    last(): Promise<any>
}

// ===================== ISO =====================

export class ISO {
    constructor(iso: {
        id: number
        name: string
        description: string
        type: string
        deprecated?: string | null
    })
    id: number
    name: string
    description: string
    type: string
    deprecated: Date | null
}

export class ISOList extends Pagination {
    constructor(endpoint: any, params: any, meta: PaginationMeta, isos: ISO[])
    isos: ISO[]
}

// ===================== Address / AddressBlock =====================

export class Address {
    constructor(
        ip: string,
        pointer: string | null,
        blocked: boolean,
        setPointerFunc: (ip: string, pointer: string | null) => Promise<any>
    )
    ip: string
    pointer: string | null
    blocked: boolean
    setPointerFunc: (ip: string, pointer: string | null) => Promise<any>

    getPointer(): string | null
    setPointer(pointer: string | null): Promise<any>
}

export class AddressBlock {
    constructor(
        ip: string,
        pointer: Array<{ ip: string; dns_ptr: string | null }>,
        blocked: boolean,
        setPointerFunc: (ip: string, pointer: string | null) => Promise<any>
    )
    ip: string
    // Raw pointer data array (name retained from original code)
    pointer: Array<{ ip: string; dns_ptr: string | null }>
    blocked: boolean
    setPointerFunc: (ip: string, pointer: string | null) => Promise<any>
    addresses: Address[]

    getAddress(ip: string): Address | null
    getPointer(ip: string): string | null
    setPointer(ip: string, pointer: string | null): Promise<any>
}

// ===================== SSH Keys =====================

export class SSHKey {
    constructor(
        endpoint: any,
        sshKey: {
            id: number
            name: string
            fingerprint: string
            public_key: string
        }
    )
    endpoint: any
    id: number
    name: string
    fingerprint: string
    publicKey: string

    changeName(name: string): Promise<any>
    delete(): Promise<any>
}

export class SSHKeyList extends Pagination {
    constructor(endpoint: any, params: any, meta: PaginationMeta, sshKeys: SSHKey[])
    sshKeys: SSHKey[]
}

// ===================== Network =====================

export class Subnet {
    // TODO: Fill fields (type, ip_range, network_zone, etc.)
    constructor(subnet: any)
}

export class Route {
    // TODO: Fill fields (destination, gateway)
    constructor(route: any)
}

export class Network {
    constructor(
        endpoint: any,
        network: {
            id: number
            name: string
            ip_range: string
            subnets: any[]
            routes: any[]
            servers: any
            load_balancers: any
            protection: any
            labels: Labels
            created: string
        }
    )
    endpoint: any
    id: number
    name: string
    ip_range: string
    subnets: Subnet[]
    routes: Route[]
    servers: any // TODO: refine
    load_balancers: any // TODO: refine
    protection: any // TODO: refine
    labels: Labels
    created: Date

    addSubnet(type: string, ipRange: string, networkZone: string): Promise<any>
    deleteSubnet(ipRange: string): Promise<any>
    addRoute(destination: string, gateway: string): Promise<any>
    deleteRoute(destination: string, gateway: string): Promise<any>
    changeIPRange(ipRange: string): Promise<any>
    changeNetworkProtection(disableDelete: boolean): Promise<any>
}

export class NetworkList extends Pagination {
    constructor(endpoint: any, params: any, meta: PaginationMeta, networks: Network[])
    networks: Network[]
}

// ===================== Servers (Complété) =====================

export class PublicNetwork {
    ipv4: Address;
    ipv6: AddressBlock;
    floatingIPs: number[];
}

export class Traffic {
    outgoing: number | null;
    ingoing: number | null;
    included: number;
    getPercentage(): number;
}

export class Server {
    constructor(server: any)
    id: number;
    name: string;
    status: 'running' | 'initializing' | 'starting' | 'stopping' | 'off' | 'deleting' | 'migrating' | 'rebuilding' | 'unknown';
    created: Date;
    publicNet: PublicNetwork;
    serverType: ServerType;
    datacenter: Datacenter;
    image: Image | null;
    iso: ISO | null;
    rescueEnabled: boolean;
    locked: boolean;
    backupWindow: string | null;
    traffic: Traffic;
    rootPassword: string | null;
    protection: any;
    // Méthodes documentées
    changeName(name: string): Promise<Server>;
    delete(): Promise<Action>;
    getActions(params?: any): Promise<ServerActionList>;
    getAction(id: number): Promise<Action>;
    powerOn(): Promise<Action>;
    powerOff(): Promise<Action>;
    reboot(): Promise<Action>;
    reset(): Promise<Action>;
    shutdown(): Promise<Action>;
    resetPassword(): Promise<{ rootPassword: string; action: Action }>;
    enableRescue(type?: string, sshKeys?: Array<number | string | SSHKey>): Promise<any>;
    disableRescue(): Promise<Action>;
    createImage(type?: string, description?: string): Promise<{ image: Image; action: Action }>;
    rebuild(image: number | string | Image): Promise<Action>;
    changeType(type: number | string | ServerType, upgradeDisk?: boolean): Promise<Action>;
    enableBackup(backupWindow?: string): Promise<Action>;
    disableBackup(): Promise<Action>;
    attachISO(iso: number | string | ISO): Promise<Action>;
    detachISO(): Promise<Action>;
    changeProtection(data: { delete?: boolean; rebuild?: boolean }): Promise<Action>;
    requestConsole(): Promise<{ wssUrl: string; password: string; action: Action }>;
}

export class ServerList extends Pagination {
    constructor(endpoint: any, params: any, meta: PaginationMeta, servers: Server[])
    servers: Server[]
}

// ===================== Floating IPs (Complété) =====================

export class FloatingIP {
    constructor(fip: any)
    // Méthodes documentées
    getActions(params?: any): Promise<FloatingIPActionList>
    getAction(id: number): Promise<Action>
    isV4(): boolean
    isV6(): boolean
    changeDescription(description: string): Promise<FloatingIP>
    delete(): Promise<any>
    assign(server: number | string | Server): Promise<Action>
    unassign(): Promise<Action>
    getAddress(ip: string): Address | null
    getPointer(ip: string): string | null
    setPointer(ip: string, pointer: string): Promise<Action>
    changeProtection(data: any): Promise<any>
}

export class FloatingIPList extends Pagination {
    constructor(endpoint: any, params: any, meta: PaginationMeta, floatingIPs: FloatingIP[])
    floatingIPs: FloatingIP[]
}

export class FloatingIPBuilder {
    constructor(endpoint: any)
    // TODO: finalize(): Promise<FloatingIP>
}

export class FloatingIPActionList extends Pagination {
    constructor(endpoint: any, params: any, meta: PaginationMeta, actions: Action[])
    actions: Action[]
}

// ===================== Images (Complété) =====================

export class Image {
    constructor(image: any)
    id: number
    name: string | null
    description: string
    imageSize: number | null
    diskSize: number
    created: Date
    createdFrom: any | null
    boundTo: number | null
    osFlavor: string
    osVersion: string | null
    rapidDeploy: boolean
    protection: any
    update(description?: string, type?: string): Promise<Image>
    delete(): Promise<any>
}

export class ImageList extends Pagination {
    constructor(endpoint: any, params: any, meta: PaginationMeta, images: Image[])
    images: Image[]
}

// ===================== Datacenters (Complété) =====================

export class Datacenter {
    constructor(dc: any)
    id: number
    name: string
    description: string
    location: Location
    serverTypes: any
    isSupported(serverType: number | ServerType): boolean
    isAvailable(serverType: number | ServerType): boolean
}

export class DatacenterList extends Pagination {
    constructor(endpoint: any, params: any, meta: PaginationMeta, datacenters: Datacenter[])
    datacenters: Datacenter[]
}

// ===================== Locations (Complété) =====================

export class Location {
    constructor(location: any)
    id: number
    name: string
    description: string
    country: string
    city: string
    latitude: number
    longitude: number
}

export class LocationList extends Pagination {
    constructor(endpoint: any, params: any, meta: PaginationMeta, locations: Location[])
    locations: Location[]
}

// ===================== Server Types (Complété) =====================

export class ServerType {
    constructor(serverType: any)
    id: number
    name: string | null
    description: string
    cores: number
    memory: number
    disk: number
    storageType: string
    prices: any
}

export class ServerTypeList extends Pagination {
    constructor(endpoint: any, params: any, meta: PaginationMeta, serverTypes: ServerType[])
    serverTypes: ServerType[]
}

// ===================== Action =====================

export class Action {
    id: number;
    command: string;
    status: 'success' | 'running' | 'error';
    progress: number;
    started: Date;
    finished: Date | null;
    resources: any[];
}

// ===================== Client =====================

export interface ClientOptions {
    token: string
    endpoint?: string // default Hetzner API base, if overridden
    // TODO: any other internal options supported by library
}

/**
 * Root API client.
 * NOTE: Methods need to be filled in after inspecting lib/client.js.
 */
export class Client {
    constructor(options: ClientOptions)

    actions: {
        list(params?: any): Promise<ActionList>
        get(id: number): Promise<Action>
    }

    servers: {
        list(params?: any): Promise<ServerList>
        get(id: number): Promise<Server>
        build(name: string): ServerBuilder
        changeName(id: number, name: string): Promise<Server>
        delete(id: number): Promise<Action>
        actions: {
            list(params?: any): Promise<ServerActionList>
            get(id: number): Promise<Action>
        }
    }

    floatingIPs: {
        list(params?: any): Promise<FloatingIPList>
        get(id: number): Promise<FloatingIP>
        build(type: string): FloatingIPBuilder
        changeDescription(id: number, description: string): Promise<FloatingIP>
        delete(id: number): Promise<any>
        actions: {
            list(params?: any): Promise<FloatingIPActionList>
            get(id: number): Promise<Action>
        }
    }

    sshKeys: {
        list(params?: any): Promise<SSHKeyList>
        get(id: number): Promise<SSHKey>
        create(payload: { name: string; public_key: string }): Promise<{ ssh_key: SSHKey }>
    }

    serverTypes: {
        list(params?: any): Promise<ServerTypeList>
        get(id: number): Promise<ServerType>
    }

    locations: {
        list(params?: any): Promise<LocationList>
        get(id: number): Promise<Location>
    }

    datacenters: {
        list(params?: any): Promise<DatacenterList>
        get(id: number): Promise<Datacenter>
    }

    images: {
        list(params?: any): Promise<ImageList>
        get(id: number): Promise<Image>
    }

    isos: {
        list(params?: any): Promise<ISOList>
        get(id: number): Promise<ISO>
    }

    // Les autres endpoints (networks, loadBalancers, loadBalancerTypes) peuvent être complétés de façon similaire si besoin
}

// ===================== Module Exports (CommonJS compatibility) =====================

declare const hcloud: {
    Client: typeof Client

    APIError: typeof APIError
    Pagination: typeof Pagination

    Action: typeof Action
    ActionList: typeof ActionList

    Server: typeof Server
    ServerList: typeof ServerList
    ServerBuilder: typeof ServerBuilder
    ServerActionList: typeof ServerActionList

    FloatingIP: typeof FloatingIP
    FloatingIPList: typeof FloatingIPList
    FloatingIPBuilder: typeof FloatingIPBuilder
    FloatingIPActionList: typeof FloatingIPActionList

    SSHKey: typeof SSHKey
    SSHKeyList: typeof SSHKeyList

    ServerType: typeof ServerType
    ServerTypeList: typeof ServerTypeList

    Location: typeof Location
    LocationList: typeof LocationList

    Datacenter: typeof Datacenter
    DatacenterList: typeof DatacenterList

    Image: typeof Image
    ImageList: typeof ImageList

    ISO: typeof ISO
    ISOList: typeof ISOList

    Network: typeof Network
    NetworkList: typeof NetworkList
    Route: typeof Route
    Subnet: typeof Subnet

    LoadBalancer: typeof LoadBalancer
    LoadBalancerList: typeof LoadBalancerList

    LoadBalancerType: typeof LoadBalancerType
    LoadBalancerTypeList: typeof LoadBalancerTypeList
}

import HetznerCloud from 'npm:hcloud-js';
export default HetznerCloud;