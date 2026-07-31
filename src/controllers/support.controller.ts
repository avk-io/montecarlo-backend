import asyncHandler from '../utils/asyncHandler';
import SupportTicket from "../models/supportTicket.model"
import { success, error } from '../utils/response';

export const createTicket = asyncHandler(async(req,res)=>{
    const{
        title,
        description,
        category,
        orderId,
        listingId,
    } = req.body;

    if(!title || !description || !category){
        return error(res,400,"Title,description and category are required");
    }

    const ticket = await SupportTicket.create({
        title,
        description,
        category,
        userId: req.user.userId,
        orderId,
        listingId,
    });

    return success(res,ticket);

})

export const getMyTickets = asyncHandler(async(req,res)=>{
    const tickets = await SupportTicket.find({
        userId: req.user.userId,
    }).sort({createdAt: -1});

    return success(res,tickets);
})