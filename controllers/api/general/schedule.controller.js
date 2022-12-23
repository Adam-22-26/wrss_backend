module.exports = (query, mutation, responseUtil, getAdminId) => {
  return {
    createSchedule: async (req, res) => {
      const admin = getAdminId(req);
      const payload = req.body;
      const { schedule: data, error } = await mutation.createSchedule({
        ...payload,
        admin,
      });
      if (data && !error) {
        responseUtil.generateServerResponse(
          res,
          201,
          "success",
          "creating schedule",
          data,
          "create_schedule"
        );
      } else {
        responseUtil.generateServerErrorCode(
          res,
          400,
          "Error",
          "Oops something went wrong, please try again",
          "create_schedule"
        );
      }
    },
    checkIfcustomerHasSchedule: async (req, res) => {
      const admin = getAdminId(req);
      const { id } = req.params;
      const { data, error } = await query.checkIfcustomerHasSchedule({
        customer: id,
        admin,
      });
      if (data && !error) {
        responseUtil.generateServerResponse(
          res,
          201,
          "success",
          "get schedule",
          data,
          "get_schedule"
        );
      } else {
        responseUtil.generateServerErrorCode(
          res,
          400,
          "Error",
          "Oops something went wrong, please try again",
          "get_schedule"
        );
      }
    },
    getSchedulesByDate: async (req, res) => {
      const { date, place } = req.params;
      const admin = getAdminId(req);
      const { data, error } = await query.getSchedulesByDate({
        date,
        admin,
        place,
      });

      if (data && !error) {
        responseUtil.generateServerResponse(
          res,
          200,
          "success",
          "get schedules",
          data,
          "get_schedules_by_date"
        );
      } else {
        responseUtil.generateServerErrorCode(
          res,
          400,
          "Error",
          "Oops something went wrong, please try again",
          "get_schedules_by_date"
        );
      }
    },
    assignSchedule: async (req, res) => {
      const admin = getAdminId(req);
      const personel_id = req.user?._id;
      const { schedule_id } = req.body;
      // from transactions
      const { data, error } = await mutation.assignSchedule({
        admin,
        personel_id,
        schedule_id,
      });
      if (data && !error) {
        responseUtil.generateServerResponse(
          res,
          201,
          "success",
          "assign schedule",
          data,
          "assign_schedule"
        );
      } else {
        responseUtil.generateServerErrorCode(
          res,
          400,
          "Error",
          "Oops something went wrong, please try again",
          "assign_schedule"
        );
      }
    },
    getAssignedScheduleByPersonel: async (req, res) => {
      const admin = getAdminId(req);
      const personel_id = req.user?._id;
      const payload = {
        personel_id,
      };
      const { data, error } = await query.getAssignedScheduleByPersonel(
        payload
      );
      if (data && !error) {
        responseUtil.generateServerResponse(
          res,
          201,
          "success",
          "assigend schedule",
          data,
          "get_assigend_schedule"
        );
      } else {
        responseUtil.generateServerErrorCode(
          res,
          400,
          "Error",
          "Oops something went wrong, please try again",
          "get_assigend_schedule"
        );
      }
    },
  };
};