import { Request, Response } from "express";
import { BlogService } from "./blog.service.js";
import { plainToInstance } from "class-transformer";
import { GetBlogsDto } from "./dto/get-blogs.dto.js";

export class BlogController {
  constructor(private blogService: BlogService) {}

  getBlogs = async (req: Request, res: Response) => {
    const query = plainToInstance(GetBlogsDto, req.query);
    const result = await this.blogService.getBlogs(query);
    return res.status(200).send(result);
  };

  getBlogBySlug = async (req: Request, res: Response) => {
    const slug = String(req.params.slug);
    const result = await this.blogService.getBlogBySlug(slug);
    return res.status(200).send(result);
  };
}
