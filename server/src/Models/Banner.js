import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: true,
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
