import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const getData = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, "../../db.json");
  const rawData = fs.readFileSync(filePath).toString();
  return rawData;
};

export const writeData = (data: string) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, "../../db.json");
  fs.writeFileSync(filePath, data);
};
