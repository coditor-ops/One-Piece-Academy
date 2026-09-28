// ponytail: inline Zod validation — no need for a separate middleware factory
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: result.error.issues[0].message },
      });
    }
    req.body = result.data;
    next();
  };
}
