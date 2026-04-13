import axios from "axios";
const config = { headers: new axios.AxiosHeaders() };
config.headers["X-Test"] = "hello";
console.log(config.headers.toJSON ? config.headers.toJSON() : config.headers);
config.headers.set("X-Test-2", "world");
console.log(config.headers.toJSON ? config.headers.toJSON() : config.headers);
