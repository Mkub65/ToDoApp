import { User } from '../models/user';
import dynamoDb from '../config/dynamoDbConfig';

export interface IUserRespository {
    getUserById(id: string): Promise<User | undefined>;
    createUser(user: User): Promise<void>;
    updateUser(id: string, user: Partial<User>): Promise<boolean>;
}

export class UserRepository implements IUserRespository {

    async getUserById(id: string): Promise<User | undefined>{
        try {
            const params = {
                TableName: process.env.DYNAMO_TABLE_NAME!,
                Key: { id }
            };
            const result = await dynamoDb.get(params).promise();
            return result.Item as User || null;
        } catch (error) {
            console.log('Error while getting user from db',error);
            return undefined;
        }
    }

    async createUser(user: User): Promise<void> {

    }

    async updateUser(id: string, user: Partial<User>): Promise<boolean> {

    }

    async login(loginDto: LoginDto) {

    }

    async registerUser(registerDto: RegisterDto) {
        
    }
}