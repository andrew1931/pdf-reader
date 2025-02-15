import { DbClient, DataTypes } from "./db.ts";

export type Issue = {
    id: number;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    resolveComment: string;
};

type NewIssue = {
    addedBy: number | null;
    description: string;
};

export const IssueReportsModel = (() => {
    const model = DbClient.instance.define(
        'IssueReport',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            addedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT("long"),
                allowNull: false,
            },
            status: {
                type: DataTypes.INTEGER,
                defaultValue: 0 // define statuses
            },         
            resolveComment: {
                type: DataTypes.TEXT("medium")
            }
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
        async save(issue: NewIssue): Promise<Issue> {
            const addedIssue = await model.create(issue);
            return addedIssue.dataValues;
        }
    }
})();