// src/types/express.d.ts
import { IUserResponseDTO } from "../types/user.type.js";

declare global {
  namespace Express {
    interface Request {
      /**
       * Added by authentication middleware – the currently authenticated user.
       */
      user?: IUserResponseDTO;
    }
  }
}

export {};
