const { sequelize } = require("../model");
const { getProfile } = require("../middleware/getProfile");
const { Op, fn, col, literal } = require("sequelize");

exports.findBestProfession = async (req, res) => {
  const { Contract, Job, Profile } = req.app.get("models");
  var { start, end } = req.query;
  try {
    const results = await Job.findAll({
      where: {
        paid: true,
        paymentDate: {
          [Op.between]: [new Date(start), new Date(end)],
        },
      },
      include: [
        {
          model: Contract,
          include: [{ model: Profile, as: "Contractor", attributes: [] }],
          attributes: [],
        },
      ],
      attributes: [
        [fn("sum", col("price")), "total"],
        [col("Contract.Contractor.profession"), "profession"],
      ],
      group: [col("Contract.Contractor.profession")],
      order: [[literal("total"), "DESC"]],
    });

    if (!results.length) return res.status(404).end();

    return res.json(results[0]);
  } catch (error) {
    res.status(500).end();
  }
};

exports.findBestClients = async (req, res) => {
  const { start, end, limit } = req.query;
  const { Job, Contract, Profile } = req.app.get("models");
  try {
    const results = await Job.findAll({
      raw: true,
      attributes: [[fn("SUM", col("price")), "totalPaid"]],
      include: [
        {
          model: Contract,
          required: true,
          include: [
            {
              model: Profile,
              required: true,
              as: "Client",
            },
          ],
        },
      ],
      where: {
        paymentDate: { [Op.between]: [new Date(start), new Date(end)] },
        paid: true,
      },
      group: ["Contract.ClientId"],
      order: [[col("totalPaid"), "DESC"]],
      limit: limit || 2,
    });

    if (!results.length) return res.status(404).end();

    res.json(
      results.map((result) => ({
        id: result["Contract.Client.id"],
        paid: result.totalPaid,
        fullName: `${result["Contract.Client.firstName"]} ${result["Contract.Client.lastName"]}`,
      }))
    );
  } catch (error) {
    res.status(500).end();
  }
};
