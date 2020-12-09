export default {
  required: (field: string) => `Field '${field}' is required.`,
  isType: (field: string, type: string) => `Field '${field}' must be a ${type} type.`,
};
