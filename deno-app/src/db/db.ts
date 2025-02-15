import { Sequelize, DataTypes, Op } from "sequelize";
import mysql from "mysql2";
import { config } from "../config.ts";
import { logger } from "../logger.ts";
import { errorToString } from "../utils.ts";

export const DbClient = (() => {

   let sequelize: Sequelize | undefined;

   function createDbIfNotExist(): Promise<void> {
      return new Promise((resolve) => {
         const connection = mysql.createConnection({
            host: "localhost",
            user: config.dbUser,
            password: config.dbPassword,
         });
         connection.query(
            `CREATE DATABASE IF NOT EXISTS ${config.dbName}`,
            (err) => {
               if (err) {
                  logger.error(err.message);
               }
               connection.end();
               resolve();
            }
         );
      });
   }

   function initialize() {
      return new Sequelize(
         config.dbName,
         config.dbUser as string,
         config.dbPassword,
         {
            host: "localhost",
            dialect: "mysql"
         }
      );
   }

   return {
      async init() {
         await createDbIfNotExist();
         sequelize = initialize();
         try {
            await sequelize.authenticate();
            logger.info('Connection has been established successfully.');
         } catch (error) {
            logger.error('Unable to connect to the database:', errorToString(error));
         }
      },
      get instance() {
         if (!sequelize) {
            sequelize = initialize(); 
         }
         return sequelize;
      }
   }
})();

export { Sequelize, DataTypes, Op };