# SimpleConsul
The goal is to simplify the usage of consul in your nodeJS application

This is currently a work in progress project, and improvements are to come

## Consul support
- Register
- Deregister
- Get key value


## Usage

Connecting to the instance
```
const consul = new SimpleConsul({
  host: "consul",
  name: "Name"
});
```

Registering the service
```
consul.register();
```

De-Registering the service
```
consul.deregister();
```

fetching value from key within a folder
```
consul.get("key", "namespace")
.then(key => console.log(key)) // {key: value}
.catch(err => console.log(err));
```

fetching multiple keys
```
consul.get(["key", "key1", "key2"])
.then(key => console.log(key)) // {key: value, key1: value}
.catch(err => console.log(err));
```