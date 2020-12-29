import mysql, { Pool } from 'mysql';
import moment from 'moment';

import Config from '../config';

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

  executeQuery(statements: string, values?: any[]): Promise<any> {
    const that = this;

    return new Promise((resolve, reject) => {
      that.connection.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          connection.query(statements, values, (err, results) => {
            connection.release();

            if (Config.LOG_DB_QUERIES && Config.IS_DEV_ENV) {
              console.log(
                `${statements} ${values ? `{ ${values.join(', ')} }` : ''} - ${moment().format(
                  'DD.MM.YYYY HH:mm:ss'
                )}`
              );
            }

            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
          });
        }
      });
    });
  }
}

// Create a singleton instance
export default new MySqlStore();
