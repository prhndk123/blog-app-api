import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
};
