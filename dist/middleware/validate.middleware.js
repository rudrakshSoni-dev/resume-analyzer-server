"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = exports.validate = void 0;
const express_validator_1 = require("express-validator");
/**
 * ZOD VALIDATION MIDDLEWARE
 */
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        // LOG FULL ERROR (important for debugging)
        console.log("VALIDATION ERROR:", result.error.issues);
        return res.status(400).json({
            message: "Validation failed",
            errors: result.error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            })),
        });
    }
    // sanitized + typed data
    req.body = result.data;
    next();
};
exports.validate = validate;
/**
 * EXPRESS-VALIDATOR HANDLER (optional)
 */
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(" EXPRESS VALIDATION ERROR:", errors.array());
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array(),
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
