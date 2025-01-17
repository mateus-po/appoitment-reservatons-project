var User = require('../models/User')
import { Request, Response } from "express";

module.exports.doctors_get = async (req:Request, res:Response) => {
    const users = await User.find({role: 'doctor'}, '_id nickname description role')
    const response = users.map((u:any) => {
        return {id: u._id, nickname: u.nickname, description: u.description, role: u.role}
    })
    res.json(response)
}