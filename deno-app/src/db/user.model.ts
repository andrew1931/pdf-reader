import { DbClient, DataTypes } from "./db.ts";

export const USER_ROLES = {
    ADMIN: "Admin",
    USER: "User",
    ANONYMOUS: "Anonymous",
};

export type User = {
    id: number;
    email: string;
    password: string;
    role: string;
    createdAt: string;
    updatedAt: string;
};

export const UserModel = (() => {
    const model = DbClient.instance.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
            },
            role: {
                type: DataTypes.STRING,
            },
        },
        {
            timestamps: true,
        },
    );
    return {
        target: model,
        sync() {
            model.sync();
        },
        async findById(userId: number): Promise<User | null> {
            const user = await model.findOne({ where: { id: userId } });
            return user?.dataValues || null;
        },
        async findByEmail(email: string): Promise<User | null> {
            const user = await model.findOne({ where: { email } });
            return user?.dataValues || null;
        },
        async save(user: { email: string; password: string, role: string }): Promise<User> {
            const addedUser = await model.create(user);
            return addedUser.dataValues;
        },
        async updatePassword(password: string, userId: number): Promise<number> {
            const updatedUser = await model.update(
                { password },
                { where: { id: userId } }
            );
            return updatedUser[0];
        }
    }
})();