import express, { Router } from "express";
import { BlogController } from "./blog.controller.js";

export class BlogRouter {
  private router: Router;

  constructor(private blogController: BlogController) {
    this.router = express.Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/", this.blogController.getBlogs);
  };

  getRouter = () => {
    return this.router;
  };
}
