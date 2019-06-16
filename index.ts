import consul, { Consul } from "consul";
import os from "os";

type ConsulConfig = {
  host: string;
  port?: string;
  acl?: string;
  secure?: boolean;
  name?: string;
  hostname?: boolean;
};

interface KeyObject {
  [key: string]: string;
}

const isJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

class KeyValue {
  private connection: Consul;

  constructor(connection: Consul) {
    this.connection = connection;
  }

  get = async (key: string | Array<string>, namespace?: string) => {
    const ns = `${namespace}/` || "";
    let keys: Array<string> = [];
    if (typeof key === "string") {
      keys = [key];
    }
    if (typeof key === "object") {
      keys = [...key];
    }

    const values = await Promise.all(
      keys.map(k => this.connection.kv.get(`${ns}${k}`))
    );

    return values.reduce((acc: KeyObject, value: any) => {
      if (isJson(value.Value)) {
        acc[value.Key.split("/").pop()] = JSON.parse(value.Value);
      } else {
        acc[value.Key.split("/").pop()] = value.Value;
      }
      return acc;
    }, {});
  };

  set = async (key: string, value: string) =>
    await this.connection.kv.set(key, value);
}

class SimpleConsul {
  private connection: Consul;
  private config: ConsulConfig;
  private name: string;
  public kv: KeyValue;

  constructor(config: ConsulConfig) {
    this.connection = consul({
      ...config,
      promisify: true
    });

    let name = `${config.name || process.env.npm_package_name}`;

    if (config.hostname === undefined || config.hostname) {
      name = `${name}-${os.hostname()}`;
    }
    this.config = config;
    this.name = name;
    this.kv = new KeyValue(this.connection);
  }

  //   Register the service to consul
  register = () =>
    this.connection.agent.service.register(this.name).catch(console.error);

  // Deregister the service
  deregister = () =>
    this.connection.agent.service.deregister(this.name).catch(console.error);
}

export default (config: ConsulConfig) => new SimpleConsul(config);

// Spec
const c = new SimpleConsul({
  host: "localhost",
  name: "Bjartes test"
});

c.kv
  .get(["google", "linkedin"], "OAuth")
  .then(console.log)
  .catch(console.error);
