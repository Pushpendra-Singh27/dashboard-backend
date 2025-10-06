const Client = require("../models/Client");

const changeStatusOfClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { isActive } = req.body;

        const client = await Client.findOneAndUpdate(
            { clientId },
            { isActive },
            { new: true }
        );

        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        res.status(200).json({
            message: "Client status updated successfully",
            client,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { changeStatusOfClient };
