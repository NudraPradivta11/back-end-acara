import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

type TRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
};

const registerValidateSchema = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string()
    .required()
    .min(6, "Password must be at least 6 characters")
    .test(
      "at-least-one-uppercase-letter",
      "Contains at least one uppercase letter",
      (value) => {
        if (!value) return false;
        const regex = /^(?=.*[A-Z])/;
        return regex.test(value);
      }
    )
    .test("at-least-one-number", "Contains at least one number", (value) => {
      if (!value) return false;
      const regex = /^(?=.*\d)/;
      return regex.test(value);
    }),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password"), ""], "Password not match"),
});

export default {
  async register(req: Request, res: Response) {
    /**
     #swagger.tags= ['Auth']
     */
    const { fullName, username, email, password, confirmPassword } =
      req.body as unknown as TRegister;

    try {
      await registerValidateSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
      });

      response.success(res, result, "Success registration!");
    } catch (error) {
      response.error(res, error, "Failed registration");
    }
  },
  async login(req: Request, res: Response) {
    /**
     #swagger.tags= ['Auth']
     #swagger.requestBody = {
     required: true,
     schema: {$ref: "#/components/schemas/LoginRequest"}
     }
     */
    const { identifier, password } = req.body as unknown as TLogin;
    try {
      // ambil data user berdasarkan "identifier" -> email dan username

      const userByIdentifier = await UserModel.findOne({
        $or: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
        isActive: true,
      });
      if (!userByIdentifier) {
        return response.unauthorized(res, "user not found");
      }

      // validasi password
      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password;
      if (!validatePassword) {
        return response.unauthorized(res, "user not found");
      }
      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      response.success(res, token, "Login success");
    } catch (error) {
      const err = error as unknown as Error;
      response.error(res, error, "Login failed");
    }
  },

  async me(req: IReqUser, res: Response) {
    /**
     #swagger.tags= ['Auth']
     #swagger.security = [{
     "bearerAuth": []
     }]
     */

    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      response.success(res, result, "Success get user profile");
    } catch (error) {
      const err = error as unknown as Error;
      response.error(res, error, "Get user profile failed");
    }
  },
  async activation(req: Request, res: Response) {
    /**
     #swagger.tags = ['Auth']
     #swagger.requestBody = {
     required: true,
     schema: {$ref: '#/components/schemas/ActivationRequest'}
     }
     */

    try {
      const { code } = req.body as { code: string };

      const user = await UserModel.findOneAndUpdate(
        {
          activationCode: code,
        },
        {
          isActive: true,
        },
        {
          new: true,
        }
      );
      response.success(res, user, "user successfully activation");
    } catch (error) {
      const err = error as unknown as Error;
      response.error(res, error, "user is failed activated");
    }
  },
};
