import mongoose,{Schema,Document} from "mongoose";

export interface ISupportMessage extends Document{
    ticketId :mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    message:string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const supportMessageSchema = new Schema<ISupportMessage>(
    {
        message:{
            type:String,
            required:true,
            trim:true,
            maxlength:500,
        },

        ticketId: {
            type: Schema.Types.ObjectId,
            ref: "SupportTicket",
            required:true,
        },

        senderId:{
            type:Schema.Types.ObjectId,
            ref: "user",
            required:true,
        },

        isAdmin:{
            type: Boolean,
            default : false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ISupportMessage>(
    "SupportMessage",
    supportMessageSchema
)