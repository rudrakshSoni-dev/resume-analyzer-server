import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { validationResult } from "express-validator";

/**
 * ZOD VALIDATION MIDDLEWARE
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
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

/**
 * EXPRESS-VALIDATOR HANDLER (optional)
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(" EXPRESS VALIDATION ERROR:", errors.array());

    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};