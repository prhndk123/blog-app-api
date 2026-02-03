import { Prisma, PrismaClient, User } from "../../generated/prisma/client.js";
import { PaginationQueryParams } from "../../types/pagination.js";
import { ApiError } from "../../utils/api-error.js";

interface GetUsersQuery extends PaginationQueryParams {
  search: string;
}

interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  city: string;
  street: string;
}

export class UserService {
  constructor(private prisma: PrismaClient) {}

  getUsers = async (query: GetUsersQuery) => {
    const { page, sortBy, sortOrder, take, search } = query;

    const whereClause: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.name = { contains: search, mode: "insensitive" };
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      take: take,
      skip: (page - 1) * take,
      orderBy: { [sortBy]: sortOrder },
      omit: { password: true },
      include: {
        addresses: {
          select: {
            street: true,
            city: true,
          },
        },
      },
    });

    const total = await this.prisma.user.count({ where: whereClause });

    return {
      data: users,
      meta: { page, take, total },
    };
  };

  getUser = async (id: number) => {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      omit: { password: true },
    });

    if (!user) throw new ApiError("User not found", 404);

    return user;
  };

  createUser = async (body: CreateUserBody) => {
    await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: body.name,
          email: body.email,
          password: body.password,
        },
      });

      await tx.address.create({
        data: {
          city: body.city,
          street: body.street,
          userId: newUser.id,
        },
      });
    });

    return { message: "create user success" };
  };

  updateUser = async (id: number, body: Partial<User>) => {
    await this.getUser(id);

    if (body.email) {
      const userEmail = await this.prisma.user.findUnique({
        where: { email: body.email },
      });

      if (userEmail) throw new ApiError("email already exist", 400);
    }

    await this.prisma.user.update({
      where: { id },
      data: body,
    });

    return { message: "update user success" };
  };

  deleteUser = async (id: number) => {
    await this.getUser(id);

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: "delete user success" };
  };
}
