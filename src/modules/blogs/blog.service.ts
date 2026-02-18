import { Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { generateSlug } from "../../utils/generate-slug.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { CreateBlogDTO } from "./dto/create-blog.dto.js";
import { GetBlogsDto } from "./dto/get-blogs.dto.js";

export class BlogService {
  constructor(
    private prisma: PrismaClient,
    private cloudinaryService: CloudinaryService,
  ) {}

  getBlogs = async (query: GetBlogsDto) => {
    const { page, take, sortBy, sortOrder, search } = query;

    const whereClause: Prisma.BlogWhereInput = {};

    if (search) {
      whereClause.title = { contains: search, mode: "insensitive" };
    }

    const blogs = await this.prisma.blog.findMany({
      where: whereClause,
      take: take,
      skip: (page - 1) * take,
      orderBy: { [sortBy]: sortOrder },
      include: { user: { select: { name: true } } },
    });

    const total = await this.prisma.blog.count({ where: whereClause });

    return { data: blogs, meta: { page, take, total } };
  };

  getBlog = async (id: number) => {
    return this.prisma.blog.findUnique({ where: { id } });
  };

  getBlogBySlug = async (slug: string) => {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      include: { user: { select: { name: true } } },
    });

    if (!blog) {
      throw new ApiError("Blog not found", 404);
    }

    return blog;
  };

  createBlog = async (
    body: CreateBlogDTO,
    thumbnail: Express.Multer.File,
    userId: number,
  ) => {
    //1. Cari Blog ada berdasarkan title
    const blog = await this.prisma.blog.findUnique({
      where: { title: body.title },
    });
    //2. Jika ada, throw error
    if (blog) {
      throw new ApiError("Title already in use", 400);
    }
    //3. Kalau Slug tidak ada, generate slug berdasarkan title
    const slug = generateSlug(body.title);
    //4. upload thumbnail ke cloudinary
    const { secure_url } = await this.cloudinaryService.upload(thumbnail);
    //5. Create blog baru berdasarkan body, secure_url, dan userId
    await this.prisma.blog.create({
      data: {
        ...body,
        slug,
        thumbnail: secure_url,
        userId,
      },
    });
    //6. Return message success
    return {
      message: "Blog created successfully",
    };
  };
}
