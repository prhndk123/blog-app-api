import { Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { GetBlogsDto } from "./dto/get-blogs.dto.js";

export class BlogService {
  constructor(private prisma: PrismaClient) {}

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
}
