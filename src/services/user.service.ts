//============================ Sql query ========================

// import { db } from "../config/db.js";
// import { User } from "../types/user.js";
// import { ApiError } from "../utils/api-error.js";
// import { getData, writeData } from "../utils/data.js";

// export const getUsersService = async() => {
//   const query = "select * from purwadhika.users";
//   const {rows} = await db.query <User> (query);
//   return rows;
// };

// export const getUserService = (id: number) => {
//   const result = JSON.parse(getData());

//   const user = result.users.find((user: User) => user.id === id);

//   if (!user) throw new ApiError ("user not found", 404);
//   return user;
// };

// export const createUserService = (body: User) => {
//     const result = JSON.parse(getData())
//   const latestId = result.users[result.users.length - 1].id || 0;

//   result.users.push({
//     id: latestId+ 1,
//     name: body.name,
//   });

//   writeData(JSON.stringify(result));

//   return {message: "create user success"}
// }

//============================ Prisma Implementation ========================

import { Prisma, User } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { PaginationQueryParams } from "../types/pagination.js";
import { ApiError } from "../utils/api-error.js";

interface GetUserQuery extends PaginationQueryParams{
  search:string;
}

// get user, wajib menggunakan pagination
export const getUsersService = async (query: GetUserQuery) => {
const{page, take, sortBy, SortOrder,search} = query;

const whereClause:Prisma.UserWhereInput ={
  deletedAt: null,
};

if(search){
  whereClause.name = { contains: search, mode: "insensitive" };
}

  const users = await prisma.user.findMany({
    where:whereClause,
    take:take,
    skip:(page - 1) * take,
    orderBy:{ [sortBy]: SortOrder},
    omit: { password: true },
    include:
      { addresses:
       { select: 
        { street: true, 
          city: true } 
        } 
      },
  });

  const total = await prisma.user.count({ where: whereClause });
  return {
    data: users,
    meta: {page,take,total},
  }
};

// get user spesifik

export const getUserService = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id, deletedAt: null },
    omit: { password: true },
  });

  if (!user) throw new ApiError("User not found", 404);
  return user;
};

interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  street: string;
  city: string;
}

// create user
export const createUserService = async (body: CreateUserBody) => {
  await prisma.$transaction(async (tx) => {// saat ada 2 proses harus dibungkus pakai ini, apabila salah satu gagal maka akan auto rollback
    const newUser = await tx.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
      },
    });
    await tx.address.create({
      data: {
        street: body.street,
        city: body.city,
        userId: newUser.id,
      },
    });
  });
  return { message: "create user success" };
};

// update user
export const updateUserService = async (id: number, body: Partial<User>) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) throw new ApiError("User not found", 404);
  if (body.email) {
    const userEmail = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (userEmail) throw new ApiError("Email already exists", 400);
  }

  await prisma.user.update({
    where: { id },
    data: body,
  });

  return { message: "update user success" };
};

// delete user (Hard delete)
// export const deleteUserService = async (id: number) => {
//   await getUserService(id);

//   await prisma.user.delete({
//     where: { id },
//   });
//   return { message: "delete user success" };
// };

// delete user (Soft delete)
export const deleteUserService = async (id: number) => {
  await getUserService(id);

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return { message: "delete user success" };
};
