import Banner from "../Models/Banner.js";
import s3 from "../Config/s3.js"
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export const uploadBannerImage = async (req, res) => {
    try {
        const banner = await Banner.create({
            image: req.file.location,
            adminId: req.user.id, 
        });

        res.json(banner);
    } catch (err) {
        res.status(500).json({ message: "Upload failed" });
    }
};


export const getBannerImages = async (req, res) => {
    try {
        const adminId = req.user.id; 

        const banner = await Banner.find({ adminId })
            .sort({ createdAt: -1 });
        res.set("Cache-Control", "no-store");

        res.json(banner);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch slider images" });
    }
};


export const deleteBannerImage = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await Banner.findById(id);
        if (!banner) {
            return res.status(404).json({ message: "Slider not found" });
        }

        // Extract S3 key from URL
        const imageUrl = banner.image;
        const key = imageUrl.split(".amazonaws.com/")[1];

        if (!key) {
            return res.status(400).json({ message: "Invalid S3 image path" });
        }

        // Delete from S3 (AWS SDK v3)
        await s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
            })
        );

        // Delete from DB
        await banner.deleteOne();

        res.json({ message: "Slider deleted successfully" });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Delete failed" });
    }
};

