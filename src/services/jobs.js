const { sequelize } = require("../model");
const { getProfile } = require("../middleware/getProfile");
const { Op, fn, col, literal } = require("sequelize");

exports.findUnpaid = async (req, res) => {
  const { Contract, Job } = req.app.get("models");
  const profileId = req.profile.id;

  try {
    const job = await Job.findAll({
      where: {
        paid: { [Op.or]: [false, null] },
      },
      include: {
        model: Contract,
        where: {
          status: {
            [Op.not]: "terminated",
          },
          [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }],
        },
      },
    });

    res.json(job);
  } catch (error) {
    res.status(500).end();
  }
};

exports.pay = async (req, res) => {
  const { Contract, Job, Profile } = req.app.get("models");
  const { job_id } = req.params;
  const { id: profileId, type } = req.profile;

  if (type !== "client") return res.status(403).end();
  try {
    const result = await sequelize.transaction(async (t) => {
      const client = await Profile.findOne({
        where: { id: profileId },
        lock: true,
        transaction: t,
      });
      const job = await Job.findOne({
        where: { id: job_id },
        include: {
          model: Contract,
          where: { ClientId: profileId },
        },
        lock: true,
        transaction: t,
      });

      if (!job) return res.status(404).end();

      if (client.balance < job.price) return res.status(403).end();

      const contractor = await Profile.findOne({
        where: { id: job.Contract.ContractorId },
        lock: true,
        transaction: t,
      });

      client.balance -= job.price;
      contractor.balance += job.price;
      job.paid = true;
      job.paymentDate = new Date();

      await Promise.all([
        client.save({ transaction: t }),
        contractor.save({ transaction: t }),
        job.save({ transaction: t }),
      ]);
      return res.status(200).end();
    });

    return result;
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
};
