const {mongodb} = require("../../databases");
const moment = require("moment");

//? Get order list

exports.attributes = async (req, res) => {
    const fileName = req.params.filename;

    if (fileName.indexOf(".json")) {
        const edition = fileName.split(".")[0];

        const card = await mongodb.Diamond.findOne({edition: edition}).populate({path: 'diamondTypeId'});

        let attributes = [
            {
                trait_type: "Type",
                value: card.diamondTypeId.name
            }
        ]

        if (card.deletedAt)
            return res.send({
                image: "Notfound.png",
                attributes: [
                    {
                        trait_type: "Status",
                        value: "Deactivated"
                    }
                ]
            });

        return res.send({
            name: card.name,
            description: card.description,
            image: card.ipfsImage,
            dna: card.serialNumber,
            edition: card.edition,
            category: card.diamondTypeId.name,
            date: moment(card.createdAt).unix(),
            attributes: attributes
        });
    } else {
        return res.status(404).send({});
    }

};

