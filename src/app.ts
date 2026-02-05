import express from "express";
import cors from "cors";
import { AuthService } from "./modules/auth/auth.service.js";
import { prisma } from "./lib/prisma.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { AuthRouter } from "./modules/auth/auth.router.js";
import { ApiError } from "./utils/api-error.js";
import { UserService } from "./modules/user/user.service.js";
import { UserController } from "./modules/user/user.controller.js";
import { UserRouter } from "./modules/user/user.router.js";
import { AuthMiddleware } from "./middleware/auth.middleware.js";
import { ValidationMiddleware } from "./middleware/validation.middleware.js";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middleware/error.middleware.js";
import { CloudinaryService } from "./modules/cloudinary/cloudinary.service.js";
import { UploadMiddleware } from "./middleware/upload.middleware.js";
import { MailService } from "./modules/mail/mail.service.js";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/cors.js";

const PORT = 8000;

export class App {
  app: express.Express;

  constructor() {
    this.app = express();
    this.configure();
    this.registerModules();
    this.handleError();
  }

  private configure = () => {
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(cookieParser());
  };

  private registerModules = () => {
    // shared dependency
    const prismaClient = prisma;

    // services
    const mailService = new MailService();
    const cloudinaryService = new CloudinaryService();
    const authService = new AuthService(prismaClient, mailService);
    const userService = new UserService(prismaClient, cloudinaryService);

    // controllers
    const authController = new AuthController(authService);
    const userController = new UserController(userService);

    // middlewares
    const authMiddleware = new AuthMiddleware();
    const validationMiddleware = new ValidationMiddleware();
    const uploadMiddleware = new UploadMiddleware();

    // routes
    const authRouter = new AuthRouter(authController, validationMiddleware);
    const userRouter = new UserRouter(
      userController,
      authMiddleware,
      uploadMiddleware,
    );

    // entry point
    this.app.use("/auth", authRouter.getRouter());
    this.app.use("/users", userRouter.getRouter());
  };

  private handleError = () => {
    this.app.use(errorMiddleware);
    this.app.use(notFoundMiddleware);
  };

  start() {
    this.app.listen(PORT, () => {
      console.log(`Server running on port : ${PORT}`);
    });
  }
}
