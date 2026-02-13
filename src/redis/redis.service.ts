import { connection } from "../config/redis.js";

export class RedisService {
  getValue = async (key: string) => {
    return await connection.get(key);
  };

  setValue = async (key: string, value: string, ttl?: number) => {
    if (ttl) {
      return await connection.set(key, value, "EX", ttl);
    } else {
      return await connection.set(key, value);
    }
  };
}
