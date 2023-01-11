module.exports = (Delivery, Purchase, endOfDay, startOfDay) => {
  return {
    getPersonelDelivery: async (payload, selected) => {
      try {
        const filter = {
          delivery_personel: payload?.delivery_personel,
          returned: false,
        };
        const data = await Delivery.findOne(filter).select(selected).exec();
        return { data };
      } catch (error) {
        return { error };
      }
    },

    getApprovedDelivery: async (payload, selected) => {
      //am not gonna use it again?
      try {
        const filter = {
          delivery_personel: payload?.delivery_personel,
          approved: true,
          returned: false,
        };
        const data = await Delivery.findOne(filter).select(selected).exec();
        return { data };
      } catch (error) {
        return { error };
      }
    },
    // not been used. violation: (do not create future feature)
    getAllItemsGreaterThanEqualOrderedItem: async ({
      delivery_id,
      purchase_item,
    }) => {
      const total_orders =
        Number(purchase_item.orders) + Number(purchase_item.free);
      console.log("total_orders", total_orders);
      try {
        const pipelines = [
          {
            $match: {
              _id: delivery_id,
            },
          },
          {
            $project: {
              // _id: delivery_id,
              delivery_items: {
                $filter: {
                  input: "$delivery_items",
                  as: "item",
                  cond: {
                    $and: [
                      { $gte: ["$$item.total", total_orders] },
                      {
                        $eq: [
                          "$$item.gallon",
                          { $toObjectId: purchase_item.gallon },
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        ];
        const data = await Delivery.aggregate(pipelines);
        return { data: data[0] };
      } catch (error) {
        return { error };
      }
    },
    // this the not approved yet delivery
    getPopulatedDeliveries: async (payload) => {
      try {
        const filter = {
          admin: payload?.admin,
          approved: payload?.isApproved,
          returned: false,
        };
        const data = await Delivery.find(filter)
          .populate([
            {
              path: "delivery_personel",
              model: "Personel",
              select: "firstname lastname contact_number ",
            },
            {
              path: "vehicle",
              model: "Vehicle",
              select: "vehicle_name vehicle_id ",
            },
            {
              path: "delivery_items.gallon",
              model: "Gallon",
              select: "name liter",
            },
          ])
          .exec();
        // check if all refs are populate using model.field instanceofObjectId
        return { data };
      } catch (error) {
        return { error };
      }
    },
    getPopulatedDeliveriesByPersonel: async (payload) => {
      try {
        const filter = {
          admin: payload?.admin,
          delivery_personel: payload?.delivery_personel,
          returned: payload?.isReturned,
        };
        const data = await Delivery.findOne(filter)
          .populate([
            {
              path: "vehicle",
              model: "Vehicle",
              select: "vehicle_name vehicle_id vehicle_image",
            },
            {
              path: "delivery_items.gallon",
              model: "Gallon",
              select: "name liter gallon_image",
            },
          ])
          .exec();
        // check if all refs are populate using model.field instanceofObjectId
        return { data };
      } catch (error) {
        return { error };
      }
    },
    // its querying the Purchase collection but using delivery id
    // the purpose of this is all about recent deliveries.
    getRecentDeliveries: async ({ personel_id, admin }) => {
      try {
        const deliveries = await Delivery.find({
          returned: true,
          delivery_personel: personel_id,
          admin: admin,
          "date_of_creation.utc_date": {
            $gte: startOfDay(new Date()),
            $lte: endOfDay(new Date()),
          },
        })
          .select(["_id"])
          .exec();
        console.log("deliveries", deliveries);
        const stages = [
          {
            $match: {
              personel: personel_id,
              delivery: { $in: deliveries?.map((delivery) => delivery._id) },
              "date.utc_date": {
                $gte: startOfDay(new Date()),
                $lte: endOfDay(new Date()),
              },
            },
          },
          {
            $group: {
              _id: "$delivery",
              total_orders: {
                $sum: { $sum: "$items.orders" },
              },
              total_free: {
                $sum: { $sum: "$items.free" },
              },
              total_returned_gallon: {
                $sum: { $sum: "$items.return" },
              },
              total_borrowed_gallon: {
                $sum: { $sum: "$items.borrow" },
              },
              total_credited_gallon: {
                $sum: { $sum: "$items.credit" },
              },
              total_of_all_debt_payment: {
                $sum: "$debt_payment",
              },
              total_of_all_payment: {
                $sum: "$total_payment",
              },
              total_of_all_order_to_pay: {
                $sum: "$order_to_pay",
              },
            },
          },
        ];
        const data = await Purchase.aggregate(stages);
        console.log("[RECENTSSSSS]", data);
        return { data };
      } catch (error) {
        console.log("[error]", error);
        return { error };
      }
    },
  };
};
