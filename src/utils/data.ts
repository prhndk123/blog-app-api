import fs from "fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "path";

// membuat function untuk mengambil data users dari db.json
export const getData = () => {
  const __filename = fileURLToPath(import.meta.url); // add "type":"module" in package.json
  const __dirname = dirname(__filename);
  const filePath = path.join(__dirname, "../../db.json");
  const rawData = fs.readFileSync(filePath).toString();
  return rawData;
};

// write data
export const writeData = (data: string) => {
  const __filename = fileURLToPath(import.meta.url); // add "type":"module" in package.json
  const __dirname = dirname(__filename);
  const filePath = path.join(__dirname, "../../db.json");
  fs.writeFileSync(filePath, data);
};
