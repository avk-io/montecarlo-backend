import { Schema, model, Document, Model } from "mongoose";

export interface IRefreshMeta {
    ip?: string;
    userAgent?: string;
}

export interface IUser extends Document {
    username: string;
    password: string;

    refreshTokenHash: string | null;
    refreshMeta: IRefreshMeta | null;

    payoutAddress: string|null;

    elo: number;
    isAdmin : boolean;
}

interface IUserModel extends Model<IUser> {
    getTier(elo: number): string;
}

const userSchema = new Schema<IUser, IUserModel>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
        },

        refreshTokenHash: {
            type: String,
            default: null,
        },

        refreshMeta: {
            ip: {
                type: String,
            },
            userAgent: {
                type: String,
            },
        },

        elo: {
            type: Number,
            default: 1000,
        },

        isAdmin: {
            type: Boolean,
            default: false,
        },
        
        payoutAddress:{
            type:String,
            required: false,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.statics.getTier = function (elo: number): string {
    if (elo < 1000) return "Unranked";
    if (elo < 1200) return "Trustworthy";
    if (elo < 1400) return "Established";
    if (elo < 1600) return "Elite";

    return "Legendary";
};

const User = model<IUser, IUserModel>("User", userSchema);

export default User;