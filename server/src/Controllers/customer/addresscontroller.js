import Address from "../../Models/Address.js";

export const createAddress = async (req, res) => {
  try {
    const { customerId, type } = req.body;

    const existing = await Address.findOne({ customerId, type });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `${type} address already exists`,
      });
    }

    const address = await Address.create(req.body);

    res.status(201).json({
      success: true,
      data: address,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const getCustomerAddresses = async (req, res) => {
  try {
    const { customerId } = req.params;

    const addresses = await Address.find({ customerId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: addresses.length,
      data: addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { customerId, id } = req.params;

    const address = await Address.findOneAndUpdate(
      { _id: id, customerId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      data: address,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { customerId, id } = req.params;

    const address = await Address.findOneAndDelete({
      _id: id,
      customerId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};