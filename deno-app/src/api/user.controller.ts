import { hash, verify } from "@ts-rex/bcrypt"
import { UserModel, USER_ROLES, type User } from "../db/user.model.ts";
import { createJWT, verifyJWT } from "../jwt.ts";

export class NotAuthorizedError extends Error {
   constructor() {
      super("Not unauthorized user")
   }
}

export const UserController = (() => {
   const sentCodes = new Map();
   const CODE_EXPIRATION_TIME = 60 * 1000;

   return {
      async signIn(req: Request) {
         const { email, password } = await req.json();
         const user = await UserModel.findByEmail(email);
         if (user) {
            if (verify(password, user.password)) {
               const token = await createJWT({ email: user.email, userId: user.id });
               if (user !== null) {
                  delete (user as Partial<User>).password;
               }
               return { token, user };   
            } else {
               return Promise.reject("Password is incorrect");
            };
         }
         return Promise.reject("User wasn't found");
      },
      async checkEmailAndSendCode(req: Request) {
         const { email } = await req.json();
         const user = await UserModel.findByEmail(email);
         const code = "12345";
         if (!sentCodes.has(email)) {
            sentCodes.set(email, code);
            setTimeout(() => {
               if (sentCodes.has(email)) {
                  sentCodes.delete(email);
               }
            }, CODE_EXPIRATION_TIME);
         }
         return user === null;
      },
      async signUp(req: Request) {
         const { email, password, code } = await req.json();
         const user = await UserModel.findByEmail(email);
         const correctCode = sentCodes.get(email);
         if (user) {
            return Promise.reject("User with such email already exists");
         } else if (!correctCode) {
            return Promise.reject("Code wasn't sent or is expired for email " + email);
         } else if (correctCode !== code) {
            return Promise.reject("Code is incorrect for email " + email);
         } else {
            sentCodes.delete(email);
            const hashedPassword = await hash(password);
            const user = await UserModel.save({
               email,
               password: hashedPassword,
               role: USER_ROLES.USER
            });
            const token = await createJWT({ email: user.email, userId: user.id });
            if (user !== null) {
               delete (user as Partial<User>).password;
            }
            return { token, user };
         }        
      },
      async resetPassword(req: Request) {
         const { email, password, code } = await req.json();
         const user = await UserModel.findByEmail(email);
         const correctCode = sentCodes.get(email);
         if (!user) {
            return Promise.reject("User with such email does not exist");
         } else if (!correctCode) {
            return Promise.reject("Code wasn't sent or is expired for email " + email);
         } else if (correctCode !== code) {
            return Promise.reject("Code is incorrect for email " + email);
         } else {
            sentCodes.delete(email);
            const hashedPassword = await hash(password);
            await UserModel.updatePassword(hashedPassword, user.id);
         }        
      },
      async getUser(req: Request) {
         const jwt = await verifyJWT(req);
         if (jwt.userId) {
            const user = await UserModel.findById(jwt.userId);
            if (user !== null) {
               delete (user as Partial<User>).password;
               return user;
            }
         }
      }
   }
})();