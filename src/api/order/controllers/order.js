// @ts-nocheck
"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("Please log in to create an order");
    }

    const { items, totalQuantity } = ctx.request.body.data;

    const order = await strapi.documents("api::order.order").create({
      data: {
        items,
        totalQuantity,
        orderDate: new Date(),
        userEmail: user.email,
      },
      // Connect the relation separately
      status: "published",
    });

    // Connect user to order
    await strapi.documents("api::order.order").update({
      documentId: order.documentId,
      data: {
        user: user.id,
      },
    });

    return { data: order };
  },

  async find(ctx) {
    const user = ctx.state.user;
    ctx.query.filters = {
      ...ctx.query.filters,
      user: { id: user.id },
    };
    return await super.find(ctx);
  },
}));
