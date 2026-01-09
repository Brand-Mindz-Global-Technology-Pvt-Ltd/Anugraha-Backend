import Slider from "../Models/Slider.js";
import s3 from "../Config/s3.js"
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export const uploadSliderImage = async (req, res) => {
    try {
        const slider = await Slider.create({
            image: req.file.location,
            adminId: req.user.id, // from auth middleware
        });

        res.json(slider);
    } catch (err) {
        res.status(500).json({ message: "Upload failed" });
    }
};


export const getSliderImages = async (req, res) => {
    try {
        const adminId = req.user.id; // from authmiddleware

        const sliders = await Slider.find({ adminId })
            .sort({ createdAt: -1 });

        // VERY IMPORTANT: disable cache
        res.set("Cache-Control", "no-store");

        res.json(sliders);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch slider images" });
    }
};


export const deleteSliderImage = async (req, res) => {
    try {
        const { id } = req.params;

        const slider = await Slider.findById(id);
        if (!slider) {
            return res.status(404).json({ message: "Slider not found" });
        }

        // Extract S3 key from URL
        const imageUrl = slider.image;
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
        await slider.deleteOne();

        res.json({ message: "Slider deleted successfully" });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Delete failed" });
    }
};

