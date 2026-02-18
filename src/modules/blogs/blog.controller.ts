import { Request, Response } from "express";
import { BlogService } from "./blog.service.js";
import { plainToInstance } from "class-transformer";
import { GetBlogsDto } from "./dto/get-blogs.dto.js";
import { CreateBlogDTO } from "./dto/create-blog.dto.js";
import { ApiError } from "../../utils/api-error.js";

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

  createBlog = async (req: Request, res: Response) => {
    const body = plainToInstance(CreateBlogDTO, req.body);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnail = files.thumbnail?.[0];
    if (!thumbnail) throw new ApiError("Thumbnail file is required", 400);
    const userId = res.locals.user.id;
    const result = await this.blogService.createBlog(body, thumbnail, userId);
    return res.status(200).send(result);
  };
}
