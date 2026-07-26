import User from "../models/user.model.js";
import type { IUser, IUserResponseDTO } from "../types/user.type.js";


export const createUser = async (user: IUser): Promise<IUserResponseDTO> => {
    const newUser = await User.create(user)
    return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone
    } as IUserResponseDTO;
}

export const getUserByUserUserName = async (username: string): Promise<IUser | null> => {
    const user = await User.findOne({
        where: { username },
        attributes: { include: ["password"] },
        raw: true,
    });

    if (!user) return null;

    return user as IUser;
}