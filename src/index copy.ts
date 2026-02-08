import express, { NextFunction, Request, Response } from "express";
import { userRouter } from "./routes/user.routes.js";
import { ApiError } from "./utils/api-error.js";
import { authRouter } from "./routes/auth.routes.js";
import cors from "cors";

const PORT = 8000;
const app = express();

app.use(cors());
app.use(express.json()); //agar bisa menerima request/req.body

app.get("/api", (req, res) => {
  res.status(200).send("welcome to my API");
});

app.use ("/users",userRouter)
app.use ("/auth",authRouter)

// membuat function untuk mengambil data users dari db.json

// interface User {
//   id: number;
//   name: string;
// }

// // get list of object
// app.get("/users", (req, res) => {
//   const result = JSON.parse(getData())
//   res.status(200).send(result);
// });

// // get specific user
// app.get("/users/:id", (req, res)=>{
//     const result = JSON.parse(getData())
//     const id = Number (req.params.id);

//     const user = result.users.find((user:User)=> user.id===id);

//     if (!user) return res.status(404).send ({message: "user not found"});

//     res.status(200).send(user)
// });

// // add new users
// app.post("/users", (req, res) => {
//   const result = JSON.parse(getData())
//   const latestId = result.users[result.users.length - 1].id;

//   result.users.push({
//     id: latestId+ 1,
//     name: req.body.name,
//   });

//   writeData(JSON.stringify(result));

//   res.status(200).send({ message: "add new user succes" });
// });

// //update data users
// app.patch("/users/:id", (req, res)=>{
// // cari dulu id nya ada atau tidak
// // kalo tdk ada kirim response not found
// //replace data lama dengan data baru dari req.body
// // kirim response berhasil update

// });

// // delete data
// app.delete("/users/:id", (req, res)=>{
// // cari dulu id nya ada atau tdk
// // kalo tdk ada kirim response not found
// // hapus datanya dari array berdasarkan index
// // kirim response berhasil delete

// });

app.use((err: ApiError, req : Request, res : Response, next : NextFunction) => {
  const message = err.message || "Something went wrong";
  const status = err.status || 500;
  res.status(status).send({ message});
});

app.use((req, res) => {
  res.status(404).send({ message: "Route not found!" });
});

app.listen(PORT, () => {
  console.log(`server running on port : ${PORT}`);
});


// patern nya dari service -> controller -> routes ->index