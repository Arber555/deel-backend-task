const { sequelize } = require("../model");
const { getProfile } = require("../middleware/getProfile");
const { Op, fn, col, literal } = require("sequelize");

exports.deposit = async (req, res) => {
  const { Job, Contract, Profile } = req.app.get("models");
  const { userId } = req.params;
  const { amount } = req.body;
  const { id: profileId, type } = req.profile;

  if (profileId != userId) return res.status(403).end();
  if (type != "client") return res.status(403).end();

  try {
    const result = await sequelize.transaction(async (t) => {
      const profile = await Profile.findOne({
        where: { id: userId },
        lock: true,
        transaction: t,
      });

      const result = await Job.findOne({
        attributes: [[fn("SUM", col("price")), "toPay"]],
        raw: true,
        include: [
          {
            attributes: [],
            model: Contract,
            required: true,
            where: { ClientId: profile.id },
          },
        ],
        where: {
          paid: null,
        },
        group: ["Contract.ClientId"],
        lock: true,
        transaction: t,
      });

      if (!result || amount > result.toPay * 0.25) return res.status(403).end();
      console.log("here2");
      await Profile.increment("balance", {
        by: amount,
        where: { id: userId },
        lock: true,
        transaction: t,
      });
      const updatedProfile = await Profile.findOne({
        where: { id: userId },
        lock: true,
        transaction: t,
      });
      return res.json(updatedProfile);
    });

    return result;
  } catch (error) {
    res.status(500).end();
  }
};
