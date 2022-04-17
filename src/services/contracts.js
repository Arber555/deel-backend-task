const { sequelize } = require("../model");
const { getProfile } = require("../middleware/getProfile");
const { Op, fn, col, literal } = require("sequelize");

exports.findById = async (req, res) => {
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const profileId = req.profile.id;
  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
    },
  });
  if (!contract) return res.status(404).end();
  res.json(contract);
};

exports.findAll = async (req, res) => {
  const { Contract } = req.app.get("models");
  const profileId = req.profile.id;
  try {
    const contract = await Contract.findAll({
      where: {
        status: {
          [Op.not]: "terminated",
        },
        [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
      },
    });

    res.json(contract);
  } catch (error) {
    res.status(500).end();
  }
};
