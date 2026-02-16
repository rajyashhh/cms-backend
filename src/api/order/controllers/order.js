// @ts-nocheck
"use strict";

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async find(ctx) {
    // Only return orders for the logged-in user
    ctx.query = {
      ...ctx.query,
      filters: {
        ...(ctx.query.filters || {}),
        user: ctx.state.user.id,
      },
    };
    return await super.find(ctx);
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

    return await super.findOne(ctx);
  },

  async create(ctx) {
    // Validate authenticated user
    if (!ctx.state.user) {
      return ctx.unauthorized("You must be logged in to create an order");
    }

    // Extract data from request
    const { items, totalQuantity } = ctx.request.body.data;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return ctx.badRequest("Items array is required and cannot be empty");
    }

    if (!totalQuantity || totalQuantity <= 0) {
      return ctx.badRequest("Valid totalQuantity is required");
    }

    // Create order using entityService
    const entity = await strapi.entityService.create("api::order.order", {
      data: {
        items,
        totalQuantity,
        orderDate: new Date(),
        user: ctx.state.user.id,
        userEmail: ctx.state.user.email,
      },
      populate: { user: true },
    });

    // Sanitize output
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    // Return in Strapi v4 format
    return this.transformResponse(sanitizedEntity);
  },
}));
