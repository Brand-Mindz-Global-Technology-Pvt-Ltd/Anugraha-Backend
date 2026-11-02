import Supplier from "../Models/Supplier.js";

/* GET ALL SUPPLIERS */
export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: suppliers,
        });
    } catch (error) {
        console.error("Get suppliers error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch suppliers",
        });
    }
};

/* CREATE SUPPLIER */
export const createSupplier = async (req, res) => {
    try {
        const {
            name,
            contactPerson,
            email,
            phone,
            rating,
            status,
        } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Supplier name is required",
            });
        }

        const supplier = await Supplier.create({
            name: name.trim(),
            contactPerson: contactPerson?.trim() || "",
            email: email?.trim() || "",
            phone: phone?.trim() || "",
            rating: Number(rating) || 0,
            status: status || "active",
        });

        return res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            data: supplier,
        });
    } catch (error) {
        console.error("Create supplier error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create supplier",
        });
    }
};

/* UPDATE SUPPLIER */
export const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Supplier updated successfully",
            data: supplier,
        });
    } catch (error) {
        console.error("Update supplier error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update supplier",
        });
    }
};

/* DELETE SUPPLIER */
export const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Supplier deleted successfully",
        });
    } catch (error) {
        console.error("Delete supplier error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete supplier",
        });
    }
};

/* ACTIVE SUPPLIER COUNT */
export const getActiveSupplierCount = async (req, res) => {
    try {
        const count = await Supplier.countDocuments({
            status: "active",
        });

        return res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.error("Supplier count error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch supplier count",
        });
    }
};