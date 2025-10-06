const Client = require("../models/Client");

const deleteClient = async(req, res) => {
    try{
        const {clientId} = req.params;
        const client = await Client.findOneAndDelete({clientId});

        if(!client){
            return res.status(404).json({message:"Client not found"})
        }

        res.status(200).json({message:"Client deleted successfully"})
    }
    catch(error){
        res.status(500).json({message:"Server Error", error:error.message})
    }
}

module.exports = {deleteClient};
