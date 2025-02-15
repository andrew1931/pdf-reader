import { DbClient, DataTypes } from "./db.ts";

export type Question = {
    id: number;
    askedBy: string;
    question: string;
    createdAt: string;
    updatedAt: string;
};

type NewQuestion = {
    askedBy: string;
    question: string;
};

export const QuestionModel = (() => {
    const model = DbClient.instance.define(
        'Question',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            askedBy: {
                type: DataTypes.CHAR,
                allowNull: false,
            },
            question: {
                type: DataTypes.TEXT("long"),
                allowNull: false,
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
        async save(question: NewQuestion): Promise<Question> {
            const addedQuestion = await model.create(question);
            return addedQuestion.dataValues;
        }
    }
})();