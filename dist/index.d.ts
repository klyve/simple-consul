import consul, { Consul } from "consul";
declare type ConsulConfig = {
    host: string;
    port?: string;
    acl?: string;
    secure?: boolean;
    name?: string;
    hostname?: boolean;
};
declare class KeyValue {
    private connection;
    constructor(connection: Consul);
    get: (key: string | string[], namespace?: string | undefined) => Promise<{}>;
    set: (key: string, value: string) => Promise<unknown>;
}
declare class SimpleConsul {
    private connection;
    private config;
    private name;
    kv: KeyValue;
    constructor(config: ConsulConfig);
    register: () => consul.Thenable<void>;
    deregister: () => consul.Thenable<void>;
}
declare const _default: (config: ConsulConfig) => SimpleConsul;
export default _default;
