import cors from "cors";
import express from "express";
import { prisma } from "./lib/prisma.js";
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware.js";
import { ValidationMiddleware } from "./middlewares/validation.middleware.js";
import { UploadMiddleware } from "./middlewares/upload.middleware.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { AuthRouter } from "./modules/auth/auth.router.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { UserController } from "./modules/user/user.controller.js";
import { UserRouter } from "./modules/user/user.router.js";
import { UserService } from "./modules/user/user.service.js";
import { CloudinaryService } from "./modules/cloudinary/cloudinary.service.js";
import { MailService } from "./modules/mail/mail.service.js";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/cors.js";
import { RedisService } from "./redis/redis.service.js";
import { loggerHttp } from "./lib/logger-http.js";
import { BlogService } from "./modules/blogs/blog.service.js";
import { BlogController } from "./modules/blogs/blog.controller.js";
import { BlogRouter } from "./modules/blogs/blog.router.js";

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
    this.app.use(loggerHttp);
  };

  private registerModules = () => {
    // shared dependency
    const prismaClient = prisma;

    // services
    const redisService = new RedisService();
    const mailService = new MailService();
    const cloudinaryService = new CloudinaryService();
    const authService = new AuthService(prismaClient, mailService);
    const userService = new UserService(
      prismaClient,
      cloudinaryService,
      redisService,
    );
    const blogService = new BlogService(prismaClient);

    // controllers
    const authController = new AuthController(authService);
    const userController = new UserController(userService);
    const blogController = new BlogController(blogService);

    //middlewares
    const authMiddleware = new AuthMiddleware();
    const validationMiddleware = new ValidationMiddleware();
    const uploadMiddleware = new UploadMiddleware();

    // routes
    const authRouter = new AuthRouter(
      authController,
      validationMiddleware,
      authMiddleware,
    );
    const userRouter = new UserRouter(
      userController,
      authMiddleware,
      uploadMiddleware,
    );
    const blogRouter = new BlogRouter(blogController);

    // entry point
    this.app.use("/auth", authRouter.getRouter());
    this.app.use("/users", userRouter.getRouter());
    this.app.use("/blogs", blogRouter.getRouter());
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
