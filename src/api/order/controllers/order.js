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
      // Get request data
      const requestData = ctx.request.body.data || {};
      
      // Get the authenticated user's email
      const authenticatedUser = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        ctx.state.user.id,
        { fields: ["email"] }
      );
      
      console.log("Creating order for user:", ctx.state.user.id);
      console.log("User email:", authenticatedUser?.email);
      console.log("Request data:", JSON.stringify(requestData, null, 2));
      
      // Create the order directly using entityService
      // For manyToOne relations in Strapi v4, pass the ID directly
      const newOrder = await strapi.entityService.create("api::order.order", {
        data: {
          items: requestData.items,
          orderDate: new Date().toISOString(),
          totalQuantity: requestData.totalQuantity,
          user: ctx.state.user.id,
          userEmail: authenticatedUser?.email || "",
        },
      });
      
      console.log("Order created successfully:", newOrder.id);
      
      // Return in Strapi v4 format
      return { data: newOrder };
    } catch (error) {
      console.error("Error in order creation:", error);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      
      // Return a proper error response
      return ctx.badRequest("Failed to create order", { 
        error: error.message,
        details: error.details 
      });
    }
  },
}));
