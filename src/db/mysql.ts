import mysql, { Pool } from 'mysql';

import IModel, { ModelFieldType } from './model-interface';
import Config from '../Config';

type FieldMappingType = 'to_db_field' | 'to_object_field';

class MySqlStore {
  connection: Pool;

  constructor() {
    this.connection = mysql.createPool({
      host: Config.DB_HOST,
      user: Config.DB_USER,
      password: Config.DB_PASSWORD,
      database: Config.DB_NAME,
      port: parseInt(Config.DB_PORT, 10),
    });
  }

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

  private async select<T>(
    ModelType: { new (): IModel },
    statements: string,
    values?: any[]
  ): Promise<T[]> {
    const that = this;

    return new Promise((resolve, reject) => {
      that.connection.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          connection.query(statements, values, (err, results) => {
            connection.release();

            if (err) {
              reject(err);
            } else {
              try {
                const finalResult = results.map((res: { [key: string]: any }) => {
                  const model = new ModelType();
                  const fields = model.getFields();
                  return this.mapFields(res, fields);
                });

                resolve(finalResult);
              } catch (err) {
                reject(err);
              }
            }
          });
        }
      });
    });
  }

  async findOne<T>(ModelType: { new (): IModel }, statements: string, values?: any[]): Promise<T> {
    const result = await this.select<T>(ModelType, statements, values);
    return result[0];
  }

  async find<T>(ModelType: { new (): IModel }, statements: string, values?: any[]): Promise<T[]> {
    const result = await this.select<T>(ModelType, statements, values);
    return result;
  }

  async insert<T>(ModelType: { new (): IModel }, data: { [key: string]: any }): Promise<T> {
    const model = new ModelType();
    const fields = model.getFields();
    const mappedDbData = this.mapFields(data, fields, 'to_db_field');
    delete mappedDbData.id;

    const dbDataFields = Object.keys(mappedDbData).map((key) => key);
    const dbDataValues = Object.values(mappedDbData);
    const sqlQuery = `INSERT INTO \`${model.getName()}\` (${dbDataFields.join(
      ', '
    )}) VALUES (${dbDataValues.reduce((p, n) => (p += `${p ? ', ' : ''}'${n}'`), '')});`;

    const that = this;

    return new Promise((resolve, reject) => {
      that.connection.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          connection.query(sqlQuery, (err, results) => {
            connection.release();

            if (err) {
              reject(err);
            } else {
              try {
                const returnedData: any = {
                  ...data,
                  id: results?.insertId,
                };

                resolve(returnedData);
              } catch (err) {
                reject(err);
              }
            }
          });
        }
      });
    });
  }
}

// Create a singleton instance
export default new MySqlStore();
