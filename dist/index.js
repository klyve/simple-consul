"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const consul_1 = __importDefault(require("consul"));
const os_1 = __importDefault(require("os"));
const isJson = (str) => {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
};
class KeyValue {
    constructor(connection) {
        this.get = async (key, namespace) => {
            const ns = `${namespace}/` || "";
            let keys = [];
            if (typeof key === "string") {
                keys = [key];
            }
            if (typeof key === "object") {
                keys = [...key];
            }
            const values = await Promise.all(keys.map(k => this.connection.kv.get(`${ns}${k}`)));
            return values.reduce((acc, value) => {
                if (isJson(value.Value)) {
                    acc[value.Key.split("/").pop()] = JSON.parse(value.Value);
                }
                else {
                    acc[value.Key.split("/").pop()] = value.Value;
                }
                return acc;
            }, {});
        };
        this.set = async (key, value) => await this.connection.kv.set(key, value);
        this.connection = connection;
    }
}
class SimpleConsul {
    constructor(config) {
        //   Register the service to consul
        this.register = () => this.connection.agent.service.register(this.name).catch(console.error);
        // Deregister the service
        this.deregister = () => this.connection.agent.service.deregister(this.name).catch(console.error);
        this.connection = consul_1.default(Object.assign({}, config, { promisify: true }));
        let name = `${config.name || process.env.npm_package_name}`;
        if (config.hostname === undefined || config.hostname) {
            name = `${name}-${os_1.default.hostname()}`;
        }
        this.config = config;
        this.name = name;
        this.kv = new KeyValue(this.connection);
    }
}
exports.default = (config) => new SimpleConsul(config);
