import mysql, { Pool } from 'mysql';

import IModel, { ModelFieldType } from './model-interface';
import Config from '../Config';

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

  private async q<T>(
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
                const mappedResults = results.map((res: { [key: string]: any }) => {
                  const model = new ModelType();
                  const fields = model.getFields();

                  const mappedResult = fields.reduce((prevVal, currentVal) => {
                    let fieldName: string = '';
                    let fieldVal: any;
                    const fieldObj = currentVal as ModelFieldType;

                    if (typeof currentVal === 'string') {
                      fieldName = currentVal;
                      fieldVal = res[currentVal];
                    } else if (fieldObj.db && fieldObj.to) {
                      fieldName = fieldObj.to;
                      fieldVal = res[fieldObj.db];
                    }

                    return {
                      ...prevVal,
                      [fieldName]: fieldVal,
                    };
                  }, {});

                  return mappedResult;
                });

                resolve(mappedResults);
              } catch (err) {
                reject(err);
              }
            }
          });
        }
      });
    });
  }

  async queryOne<T>(ModelType: { new (): IModel }, statements: string, values?: any[]): Promise<T> {
    const result = await this.q<T>(ModelType, statements, values);
    return result[0];
  }

  async query<T>(ModelType: { new (): IModel }, statements: string, values?: any[]): Promise<T[]> {
    const result = await this.q<T>(ModelType, statements, values);
    return result;
  }
}

// Create a singleton instance
export default new MySqlStore();
