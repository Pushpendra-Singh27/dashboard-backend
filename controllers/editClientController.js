const Client = require("../models/Client");

const editClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { name, email } = req.body;

    const client = await Client.findOneAndUpdate(
      { clientId },
      {
        name,
        email,
      },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { editClient };
