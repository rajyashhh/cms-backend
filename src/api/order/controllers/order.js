// @ts-nocheck
"use strict";

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async find(ctx) {
    // Only return orders for the logged-in user
    if (!ctx.state.user) {
      return ctx.unauthorized("You must be logged in to view orders");
    }

    const { sort, pagination } = ctx.query;

    // Use entity service to properly handle relation filters
    const orders = await strapi.entityService.findMany("api::order.order", {
      filters: {
        user: {
          id: ctx.state.user.id,
        },
      },
      sort: sort || { orderDate: "desc" },
      populate: { user: true },
      ...pagination,
    });

    // Add itemsSummary and remove items from each order
    const ordersWithSummary = orders.map((order) => {
      const items = order.items || [];
      order.itemsSummary = items
        .map((item) => `${item.productName} (x${item.quantity})`)
        .join(", ");
      delete order.items;
      return order;
    });

    // Return in REST API format
    return { data: ordersWithSummary };
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    // Find the order
    const entity = await strapi.entityService.findOne("api::order.order", id, {
      populate: { user: true },
    });

    // Check if the order belongs to the logged-in user
    if (!entity || entity.user.id !== ctx.state.user.id) {
      return ctx.unauthorized("You cannot access this order");
    }

    // Add itemsSummary and remove items
    const items = entity.items || [];
    entity.itemsSummary = items
      .map((item) => `${item.productName} (x${item.quantity})`)
      .join(", ");
    delete entity.items;

    return { data: entity };
  },

  async create(ctx) {
    // Ensure user is authenticated
    if (!ctx.state.user) {
      return ctx.unauthorized("You must be logged in to create an order");
    }

    const { items, totalQuantity } = ctx.request.body.data;

    // Create order using entity service (properly handles relations)
    const order = await strapi.entityService.create("api::order.order", {
      data: {
        items,
        totalQuantity,
        orderDate: new Date(),
        user: ctx.state.user.id, // Entity service handles relations correctly
      },
      populate: { user: true }, // Return the populated user relation
    });

    console.log("Order created for user:", ctx.state.user.id);

    // Return in the same format as REST API
    return { data: order };
  },
}));
