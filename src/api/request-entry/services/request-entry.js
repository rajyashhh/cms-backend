'use strict';

/**
 * request-entry service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::request-entry.request-entry');
