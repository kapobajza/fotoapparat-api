import MySqlStore from './mysql';
import IModel from './model-interface';

export interface QueryOptions {
  fields: string[];
  limit: number;
}

export default class BaseRepository<T> {
  private generateQuery(
    ModelType: { new (): IModel },
    extra?: string,
    options?: QueryOptions,
    shouldReturnOne?: boolean
  ) {
    const { fields, limit } = options ?? {};

    const fieldsStatement = fields ? fields.join(', ') : '*';
    const model = new ModelType();

    let finalLimit = limit ?? 10;

    if (shouldReturnOne) {
      finalLimit = 1;
    }

    return `SELECT ${fieldsStatement} FROM ${model.getName()} ${extra ?? ''} LIMIT ${finalLimit}`;
  }

  find(ModelType: { new (): IModel }, extra?: string, values?: any[], options?: QueryOptions) {
    const query = this.generateQuery(ModelType, extra, options);
    return MySqlStore.find<T>(ModelType, query, values);
  }

  findOne(ModelType: { new (): IModel }, extra?: string, values?: any[], options?: QueryOptions) {
    const query = this.generateQuery(ModelType, extra, options, true);
    return MySqlStore.findOne<T>(ModelType, query, values);
  }

  insert(ModelType: { new (): IModel }, data: { [key: string]: any }) {
    return MySqlStore.insert<T>(ModelType, data);
  }
}
