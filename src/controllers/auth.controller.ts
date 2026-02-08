import { Request, Response } from "express";
import { loginService, registerService } from "../services/auth.service.js";

export const registerController = async(req : Request, res : Response) => {
    const body = req.body
    const result = await registerService(body);
    res.status(200).send(result);
}

export const loginController = async(req : Request, res : Response) => {
    const body = req.body
    const result = await loginService(body);
    res.status(200).send(result);
}