import MySqlStore from './mysql';
import IModel, { ModelFieldType } from './model-interface';

export interface QueryOptions {
  fields: string[];
  limit: number;
}

export type FieldMappingType = 'to_db_field' | 'to_object_field';

export default class BaseRepository<T> {
  private mapFields(
    obj: { [key: string]: any },
    fields: (string | ModelFieldType)[],
    type: FieldMappingType = 'to_object_field'
  ): { [key: string]: any } {
    return fields.reduce((prevVal, currentVal) => {
      let fieldName: string = '';
      let fieldVal: any;
      const fieldObj = currentVal as ModelFieldType;

      if (typeof currentVal === 'string') {
        fieldName = currentVal;
        fieldVal = obj[currentVal];
      } else if (fieldObj.db && fieldObj.to) {
        switch (type) {
          case 'to_object_field':
            fieldName = fieldObj.to;
            fieldVal = obj[fieldObj.db];
            break;

          case 'to_db_field':
            fieldName = fieldObj.db;
            fieldVal = obj[fieldObj.to];
            break;

          default:
            break;
        }
      }

      if (!fieldVal) {
        return prevVal;
      }

      return {
        ...prevVal,
        [fieldName]: fieldVal,
      };
    }, {});
  }

  private async query(
    ModelType: { new (): IModel },
    extra?: string,
    values?: any[],
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

    const results = await MySqlStore.executeQuery(
      `SELECT ${fieldsStatement} FROM ${model.getName()} ${extra ?? ''} LIMIT ${finalLimit}`,
      values
    );

    const finalResult = results.map((res: { [key: string]: any }) => {
      const fields = model.getFields();
      return this.mapFields(res, fields);
    });

    return shouldReturnOne ? finalResult[0] : finalResult;
  }

  find(
    ModelType: { new (): IModel },
    extra?: string,
    values?: any[],
    options?: QueryOptions
  ): Promise<T[]> {
    return this.query(ModelType, extra, values, options);
  }

  findOne(
    ModelType: { new (): IModel },
    extra?: string,
    values?: any[],
    options?: QueryOptions
  ): Promise<T> {
    return this.query(ModelType, extra, values, options, true);
  }

  async insert(ModelType: { new (): IModel }, data: { [key: string]: any }) {
    const model = new ModelType();
    const fields = model.getFields();
    const mappedDbData = this.mapFields(data, fields, 'to_db_field');
    delete mappedDbData.id;

    const dbDataFields = Object.keys(mappedDbData).map((key) => key);
    const dbDataValues = Object.values(mappedDbData);
    const sqlQuery = `INSERT INTO \`${model.getName()}\` (${dbDataFields.join(
      ', '
    )}) VALUES (${dbDataValues.reduce((p, n) => (p += `${p ? ', ' : ''}'${n}'`), '')});`;

    const results = await MySqlStore.executeQuery(sqlQuery);

    const returnedData: any = {
      ...data,
      id: results?.insertId,
    };

    return returnedData;
  }
}
