// server/utils/validators.js
const joi = require("joi");

const validators = {
  email: joi.string().email().required(),
  password: joi
    .string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"))
    .required(),
  uuid: joi.string().uuid().required(),
  name: joi.string().min(2).max(100).required(),
  url: joi.string().uri().required(),

  metaObjective: joi
    .string()
    .valid(
      "OUTCOME_AWARENESS",
      "OUTCOME_TRAFFIC",
      "OUTCOME_ENGAGEMENT",
      "OUTCOME_LEADS",
      "OUTCOME_APP_PROMOTION",
      "OUTCOME_SALES"
    ),

  campaignStatus: joi.string().valid("ACTIVE", "PAUSED", "DELETED", "ARCHIVED"),
  budgetType: joi.string().valid("DAILY", "LIFETIME"),
  currency: joi.string().length(3).uppercase(),

  dateRange: joi.object({
    start: joi.date().iso().required(),
    end: joi.date().iso().greater(joi.ref("start")).required(),
  }),

  paginationQuery: joi.object({
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(20),
    sort: joi
      .string()
      .valid("createdAt", "updatedAt", "name", "spend")
      .default("createdAt"),
    order: joi.string().valid("asc", "desc").default("desc"),
  }),

  metaTargeting: joi.object({
    age_min: joi.number().integer().min(13).max(65),
    age_max: joi.number().integer().min(13).max(65),
    genders: joi.array().items(joi.number().valid(1, 2)),
    geo_locations: joi.object({
      countries: joi.array().items(joi.string().length(2)),
      regions: joi.array().items(
        joi.object({
          key: joi.string().required(),
          name: joi.string().required(),
        })
      ),
      cities: joi.array().items(
        joi.object({
          key: joi.string().required(),
          name: joi.string().required(),
          radius: joi.number().min(1).max(50),
        })
      ),
    }),
    interests: joi.array().items(
      joi.object({
        id: joi.string().required(),
        name: joi.string().required(),
      })
    ),
    behaviors: joi.array().items(
      joi.object({
        id: joi.string().required(),
        name: joi.string().required(),
      })
    ),
  }),

  createAdSet: joi.object({
    campaignId: joi.string().uuid().required(),
    name: joi.string().min(1).max(100).required(),
    budget: joi.number().min(1).max(999999).required(),
    budgetType: joi.string().valid("DAILY", "LIFETIME").default("DAILY"),
    bidStrategy: joi
      .string()
      .valid(
        "LOWEST_COST_WITHOUT_CAP",
        "LOWEST_COST_WITH_BID_CAP",
        "TARGET_COST"
      )
      .default("LOWEST_COST_WITHOUT_CAP"),
    targeting: joi.object().required(),
    placements: joi
      .object({
        publisher_platforms: joi
          .array()
          .items(
            joi
              .string()
              .valid("facebook", "instagram", "audience_network", "messenger")
          )
          .required(),
      })
      .default({ publisher_platforms: ["facebook", "instagram"] }),
  }),

  bulkCampaignAction: joi.object({
    campaignIds: joi
      .array()
      .items(joi.string().uuid())
      .min(1)
      .max(50)
      .required(),
    action: joi
      .string()
      .valid("pause", "activate", "delete", "archive")
      .required(),
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        details: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value,
        })),
      });
    }

    req.validatedBody = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: "Query Validation Error",
        details: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value,
        })),
      });
    }

    req.validatedQuery = value;
    next();
  };
};

module.exports = {
  validators,
  validate,
  validateQuery,
};
