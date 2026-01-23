
enum Role {
    ADMIN = "admin",
    MENTOR = "mentor",
    STUDENT = "student",
    MANAGER = "manager",
}

interface Account {
    id: string;
    name: string;
    users: User[];
    createdAt: Date;
    updatedAt: Date;
}

interface AccountUserRole {
    accountId: string;
    userId: string;
    role: Role;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}