const mongoose = require("mongoose");
const User = require("../models/user");

exports.softDeleteAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.deletedAt) {
      return res
        .status(400)
        .json({ message: "User account is already marked for deletion" });
    }
    user.deletedAt = new Date();
    await user.save();

    res
      .status(200)
      .json({
        message:
          "Account marked for deletion. You can restore your account within 30 days.",
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
exports.restoreAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.deletedAt) {
      return res
        .status(400)
        .json({ message: "Account is not marked for deletion." });
    }

    const currentDate = new Date();
    const daysSinceDeletion = Math.floor(
      (currentDate - user.deletedAt) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceDeletion <= 30) {
      user.deletedAt = null;
      await user.save();

      return res
        .status(200)
        .json({ message: "Account restored successfully." });
    } else {
      return res
        .status(400)
        .json({
          message:
            "Restoration period has expired. Account cannot be restored.",
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
// exports.permanentlyDeleteAccounts = async () => {
//   const currentDate = new Date();

//   try {
//     // find the user whose account is to be delted
//     const usersToDelete = await User.find({
//       deletedAt: {
//         $lt: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)
//       }
//     });

//     // if there exist the user simply remove it from db
//     if (usersToDelete.length) {
//       await User.deleteMany({
//         deletedAt: {
//           $lt: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)
//         }
//       });
//       console.log(`${usersToDelete.length} accounts permanently deleted.`);
//     }
//   } catch (error) {
//     console.error("Error deleting accounts:", error);
//   }
// };

// // // it is set for every mid night
// // cron.schedule('0 0 * * *', async () => {
// //   console.log('Running scheduled job to permanently delete accounts...');
// //   await exports.permanentlyDeleteAccounts();
// // });
