export type ModelFieldType = { db: string; to: string };

export default interface IModel {
  getFields: () => (string | ModelFieldType)[];
  getName: () => string;
}
