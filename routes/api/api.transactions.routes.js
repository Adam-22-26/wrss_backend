const router = require("express").Router();
const apiController = require("../../controllers/api/index");
const {
  authenticate,
} = require("../../middlewares/passport.authenticate.middleware");

// deliver order with schedule payload.
router.post("/deliver/orders/by-schedule", authenticate, apiController.deliverOrder)


module.exports = {
  router,
};
