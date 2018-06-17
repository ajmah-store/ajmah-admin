export class User {
    id?: any;
    type: number;
    name: string;
    email: string;
    emailVerified: boolean;
}

export const USER_TYPES = {
    ADMIN: 1,
    EDITOR: 2,
    NORMAL: 3
}

export const USERS_COLLECTION = 'users';