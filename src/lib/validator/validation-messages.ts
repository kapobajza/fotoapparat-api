export type ValidationFieldType = 'string' | 'number';

export default {
  required: (field: string) => `Field '${field}' is required.`,
  isType: (field: string, type: ValidationFieldType) => `Field '${field}' must be a ${type} type.`,
};
