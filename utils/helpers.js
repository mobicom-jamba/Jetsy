// server/utils/helpers.js
const crypto = require("crypto");
const logger = require("./logger");

class Helpers {
  static generateId(length = 16) {
    return crypto.randomBytes(length).toString("hex");
  }

  static generateApiKey() {
    return "jma_" + crypto.randomBytes(32).toString("hex");
  }

  static encrypt(text, key = process.env.ENCRYPTION_KEY) {
    if (!key) {
      throw new Error("Encryption key not provided");
    }

    const algorithm = "aes-256-cbc";
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
  }

  static decrypt(encryptedText, key = process.env.ENCRYPTION_KEY) {
    if (!key) {
      throw new Error("Encryption key not provided");
    }

    const algorithm = "aes-256-cbc";
    const parts = encryptedText.split(":");
    const iv = Buffer.from(parts.shift(), "hex");
    const encrypted = parts.join(":");

    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  static sanitizeInput(input) {
    if (typeof input !== "string") return input;

    return input
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .trim();
  }

  static formatMetaError(error) {
    if (error.response?.data?.error) {
      const metaError = error.response.data.error;
      return {
        code: metaError.code,
        message: metaError.message,
        subcode: metaError.error_subcode,
        userMessage: this.getUserFriendlyErrorMessage(metaError.code),
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      userMessage: "An unexpected error occurred",
    };
  }

  static getUserFriendlyErrorMessage(code) {
    const errorMessages = {
      1: "Unknown error occurred",
      2: "Service temporarily unavailable",
      4: "Application request limit reached",
      17: "User request limit reached",
      100: "Invalid parameter",
      190: "Invalid access token",
      200: "Requires extended permission",
      368: "The action attempted has been deemed abusive or is otherwise disallowed",
      613: "Calls to this api have exceeded the rate limit",
    };

    return (
      errorMessages[code] || "An error occurred while processing your request"
    );
  }

  static calculateMetrics(data) {
    if (!data.impressions || data.impressions === 0) {
      return {
        ctr: 0,
        cpc: 0,
        cpm: 0,
        roas: 0,
      };
    }

    const impressions = parseInt(data.impressions) || 0;
    const clicks = parseInt(data.clicks) || 0;
    const spend = parseFloat(data.spend) || 0;
    const conversions = parseInt(data.conversions) || 0;
    const revenue = parseFloat(data.revenue) || 0;

    return {
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      roas: spend > 0 ? revenue / spend : 0,
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
      costPerConversion: conversions > 0 ? spend / conversions : 0,
    };
  }

  static formatDateRange(range) {
    const formats = {
      today: {
        since: new Date().toISOString().split("T")[0],
        until: new Date().toISOString().split("T")[0],
      },
      yesterday: {
        since: new Date(Date.now() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        until: new Date(Date.now() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
      last7days: {
        since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        until: new Date().toISOString().split("T")[0],
      },
      last30days: {
        since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        until: new Date().toISOString().split("T")[0],
      },
    };

    return formats[range] || range;
  }

  static async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  static isValidUUID(uuid) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static logPerformance(operation, startTime) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    logger.info(`Performance: ${operation} completed in ${duration}ms`);

    if (duration > 5000) {
      logger.warn(`Slow operation detected: ${operation} took ${duration}ms`);
    }

    return duration;
  }
}

module.exports = Helpers;
