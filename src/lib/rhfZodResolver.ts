import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form'
import type { ZodType } from 'zod'

type RhfErrorRecord = FieldErrors<FieldValues>

export function zodResolver<TSchema extends ZodType, TValues extends FieldValues>(
  schema: TSchema,
): Resolver<TValues> {
  return (async (values: TValues) => {
    const result = schema.safeParse(values)

    if (result.success) {
      return {
        values: result.data as TValues,
        errors: {} as RhfErrorRecord,
      }
    }

    const errors: FieldErrors<FieldValues> = {}

    for (const issue of result.error.issues) {
      const path = issue.path
        .map((segment) => (typeof segment === 'string' || typeof segment === 'number' ? String(segment) : ''))
        .filter((segment) => segment.length > 0)
        .join('.') || 'root'

      if (!(path in errors)) {
        errors[path] = {
          type: issue.code,
          message: issue.message,
        }
      }
    }

    return {
      values: {} as TValues,
      errors: errors as RhfErrorRecord,
    }
  }) as unknown as Resolver<TValues>
}
