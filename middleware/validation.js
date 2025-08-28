// server/middleware/validation.js (UPDATED with new schemas)
const joi = require("joi");
const logger = require("../utils/logger");

const schemas = {
  register: joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
    name: joi.string().min(2).max(50).required(),
  }),

  login: joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  }),

  createMetaApp: joi.object({
    appId: joi.string().required().messages({
      "string.empty": "Meta App ID is required",
      "any.required": "Meta App ID is required",
    }),
    appSecret: joi.string().required().messages({
      "string.empty": "Meta App Secret is required",
      "any.required": "Meta App Secret is required",
    }),
    appName: joi.string().min(1).max(100).required().messages({
      "string.empty": "App name is required",
      "string.min": "App name must be at least 1 character",
      "string.max": "App name must be less than 100 characters",
    }),
    webhookUrl: joi.string().uri().optional().messages({
      "string.uri": "Webhook URL must be a valid URL",
    }),
  }),

  updateMetaApp: joi.object({
    appName: joi.string().min(1).max(100).optional(),
    appSecret: joi.string().optional(),
    webhookUrl: joi.string().uri().allow("").optional(),
  }),

  createCampaign: joi.object({
    metaAccountId: joi.string().uuid().required(),
    name: joi.string().min(1).max(100).required(),
    objective: joi
      .string()
      .valid(
        "OUTCOME_AWARENESS",
        "OUTCOME_TRAFFIC",
        "OUTCOME_ENGAGEMENT",
        "OUTCOME_LEADS",
        "OUTCOME_APP_PROMOTION",
        "OUTCOME_SALES"
      )
      .required(),
    budget: joi.number().min(1).max(999999).optional(),
    budgetType: joi.string().valid("DAILY", "LIFETIME").optional(),
    startTime: joi.date().iso().optional(),
    endTime: joi.date().iso().greater(joi.ref("startTime")).optional(),
    configuration: joi.object().optional(),
  }),

  updateCampaignStatus: joi.object({
    status: joi
      .string()
      .valid("ACTIVE", "PAUSED", "DELETED", "ARCHIVED")
      .required(),
  }),

  metricsQuery: joi.object({
    campaignId: joi.string().uuid().optional(),
    campaignIds: joi.array().items(joi.string().uuid()).optional(),
    dateRange: joi
      .object({
        start: joi.date().iso().required(),
        end: joi.date().iso().greater(joi.ref("start")).required(),
      })
      .optional(),
    limit: joi.number().min(1).max(1000).optional(),
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      logger.warn("Validation error:", {
        path: req.path,
        errors: error.details.map((d) => d.message),
        body: req.body,
      });

      return res.status(400).json({
        error: "Validation Error",
        details: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
    });

    if (error) {
      logger.warn("Query validation error:", {
        path: req.path,
        errors: error.details.map((d) => d.message),
        query: req.query,
      });

      return res.status(400).json({
        error: "Query Validation Error",
        details: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  schemas,
};
