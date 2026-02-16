// @ts-nocheck
"use strict";

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async find(ctx) {
    // Only return orders for the logged-in user, and populate user relation
    ctx.query = {
      ...ctx.query,
      filters: {
        ...(ctx.query.filters || {}),
        user: ctx.state.user.id,
      },
      populate: { user: { fields: ["email"] } },
      fields: ["*"], // Ensure userEmail is included
    };
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    // Find the order and populate user email
    const entity = await strapi.entityService.findOne("api::order.order", id, {
      populate: { user: { fields: ["email"] } },
      fields: ["*"], // Ensure userEmail is included
    });

    // Check if the order belongs to the logged-in user
    if (!entity || entity.user.id !== ctx.state.user.id) {
      return ctx.unauthorized("You cannot access this order");
    }

    return await super.findOne(ctx);
  },

  async create(ctx) {
    try {
      // Remove user from request body if present (security: only use authenticated user)
      const { user, ...restData } = ctx.request.body.data || {};
      
      // Get the authenticated user's email
      const authenticatedUser = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        ctx.state.user.id,
        { fields: ["email"] }
      );
      
      // Set orderDate as ISO string, user, and userEmail
      ctx.request.body.data = {
        ...restData,
        orderDate: new Date().toISOString(),
        user: ctx.state.user.id,
        userEmail: authenticatedUser?.email || "",
      };
      
      console.log("Creating order with data:", JSON.stringify(ctx.request.body.data, null, 2));
      
      const result = await super.create(ctx);
      return result;
    } catch (error) {
      console.error("Error in order creation:", error);
      ctx.throw(500, error);
    }
  },
}));
