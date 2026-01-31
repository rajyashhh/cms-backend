'use strict';

/**
 * request-entry router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::request-entry.request-entry');
