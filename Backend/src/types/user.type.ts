
export interface IUser {
    id?: number;
    username: string;
    email: string;
    password: string;
    phone?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}

/** Payload required when a client registers a new user. */
export interface IUserRegisterDTO {
    username: string;
    email: string;
    password: string;
    phone?: string;
}

export interface IUserResponseDTO {
    id: number;
    username: string;
    email: string;
    phone?: string | undefined;
}

export interface IUserLoginDTO {
    username: string;
    password: string;
}