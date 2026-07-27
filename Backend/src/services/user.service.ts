import User from "../models/user.model.js";
import type { IUser, IUserResponseDTO } from "../types/user.type.js";

export const createUser = async (user: IUser): Promise<IUserResponseDTO> => {
  try {
    const newUser = await User.create(user);
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
    } as IUserResponseDTO;
  } catch (err) {
    throw err;
  }
};

export const getUserById = async (id: number): Promise<IUserResponseDTO | null> => {
  try {
    const user = await User.findByPk(id);

    if (!user) {
      return null;
    }

    const { id: uid, username, email, phone } = user;
    return { id: uid, username, email, phone } as IUserResponseDTO;
  } catch (err) {
    throw err;
  }
};

export const getUserByUserUserName = async (
  username: string,
): Promise<IUser | null> => {
  try {
    const user = await User.findOne({
      where: { username },
      attributes: { include: ["password"] },
      raw: true,
    });

    if (!user) {
      return null;
    }

    return user as IUser;
  } catch (err) {
    throw err;
  }
};

export const getAllUsers = async (): Promise<IUserResponseDTO[] | null> => {
  try {
    const users = await User.findAll();
    return users as IUserResponseDTO[];
  } catch (err) {
    throw err;
  }
};
