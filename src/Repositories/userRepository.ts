import { User } from '../models/user';
import dynamoDb from '../config/dynamoDbConfig';
import { LoginDto } from "../models/loginDto";
import { RegisterDto } from "../models/registerDto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export interface IUserRespository {
    getUserById(id: string): Promise<User | undefined>;
    updateUser(id: string, user: Partial<User>): Promise<boolean>;
    login(loginDto: LoginDto): Promise<{ success: boolean; token?: string }>;
    registerUser(registerDto: RegisterDto): Promise<{ success: boolean; token?: string }>;
}

export class UserRepository implements IUserRespository {

    async getUserById(id: string): Promise<User | undefined> {
        try {
            const params = {
                TableName: process.env.DYNAMO_TABLE_NAME!,
                Key: { id }
            };
            const result = await dynamoDb.get(params).promise();
            return result.Item as User || undefined;
        } catch (error) {
            console.log('Error while getting user from db', error);
            return undefined;
        }
    }

    async updateUser(id: string, user: Partial<User>): Promise<boolean> {
        try {
            const updateExpression = [];
            const expressionAttributeValues: any = {};

            for (const key in user) {
                updateExpression.push(`${key} = :${key}`);
                expressionAttributeValues[`:${key}`] = (user as any)[key];
            }

            const params = {
                TableName: process.env.DYNAMO_TABLE_NAME!,
                Key: { id },
                UpdateExpression: `set ${updateExpression.join(", ")}`,
                ExpressionAttributeValues: expressionAttributeValues,
            };

            await dynamoDb.update(params).promise();
            return true;
        } catch (error) {
            console.error("Error while updating user", error);
            return false;
        }
    }

    async login(loginDto: LoginDto): Promise<{ success: boolean; token?: string }> {
        try {
            const params = {
                TableName: process.env.DYNAMO_TABLE_NAME!,
                IndexName: "email-index",
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: {
                    ":email": loginDto.email,
                },
            };

            const result = await dynamoDb.query(params).promise();
            const user = result.Items && result.Items[0] as User;

            if (!user) return { success: false };

            const isMatch = await bcrypt.compare(loginDto.password, user.password);
            if (!isMatch) return { success: false };

            const token = jwt.sign(
                { id: user.id, email: user.mail },
                process.env.JWT_SECRET!,
                { expiresIn: "1h" }
            );

            return { success: true, token };
        } catch (error) {
            console.error("Error during login", error);
            return { success: false };
        }
    }

    async registerUser(registerDto: RegisterDto): Promise<{ success: boolean; token?: string }> {
        try {
            // sprawdzamy czy istnieje użytkownik o tym emailu
            const checkParams = {
                TableName: process.env.DYNAMO_TABLE_NAME!,
                IndexName: "email-index",
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: {
                    ":email": registerDto.email,
                },
            };

            const checkResult = await dynamoDb.query(checkParams).promise();
            if (checkResult.Items && checkResult.Items.length > 0) {
                return { success: false }; // użytkownik już istnieje
            }

            const hashedPassword = await bcrypt.hash(registerDto.password, 10);

            const newUser: User = {
                id: uuidv4(),
                mail: registerDto.email,
                password: hashedPassword,
                name: registerDto.firstName,
                lastName: registerDto.lastName,
            };

            const params = {
                TableName: process.env.DYNAMO_TABLE_NAME!,
                Item: newUser,
            };

            await dynamoDb.put(params).promise();

            const token = jwt.sign(
                { id: newUser.id, email: newUser.mail },
                process.env.JWT_SECRET!,
                { expiresIn: "1h" }
            );

            return { success: true, token };
        } catch (error) {
            console.error("Error while registering user", error);
            return { success: false };
        }
    }
}
