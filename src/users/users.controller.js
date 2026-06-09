const usersService = require("./users.service");
const { successResponse } = require("../shared/response");

async function getProfile(req, res, next) {
  try {
    const user = await usersService.getUserById(req.user.id);
    successResponse(res, user);
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile };