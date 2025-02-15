import { Sequelize, DataTypes, Op } from "sequelize";
import { config } from "../config.ts";
import { logger } from "../logger.ts";
import { errorToString } from "../utils.ts";

export const DbClient = (() => {

    let sequelize: Sequelize | undefined;

    function initialize() {
        return new Sequelize({
            dialect: 'sqlite',
            storage: config.dbStorage
        });
    }

    return {
        async init() {
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