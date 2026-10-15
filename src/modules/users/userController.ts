import type { Request, Response } from "express";
import type { UserService } from "./userService.ts";
import { UserIdSchema, UserSchema } from "./user.type.ts";
import { NotFoundError } from "../../shared/utils/errors.ts";
import { z } from "zod";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public getById = async (req: Request, res: Response): Promise<void> => {
    const result = UserIdSchema.safeParse(req.params);

    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        error: z.flattenError(result.error),
      });
      return;
    }

    try {
      const user = await this.userService.getById(result.data);
      const { deleted, ...userResponse } = user;
      res.status(200).json(userResponse);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({
          message: error.message,
        });
        return;
      }

      res.status(500).json({ message: "Error retrieving user" });
    }
  }

  public add = async (req: Request, res: Response): Promise<void> => {
    // Validate user input
    const CreateUserSchema = UserSchema.omit({ id: true })
    const result = CreateUserSchema.safeParse(req.body);

    // Handle scenario where user input is not correctly formatted
    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        error: z.flattenError(result.error),
      });
      return;
    }

    try {
      const user = await this.userService.add(result.data);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error adding user" });
    }
  }

  public deleteById = async (req: Request, res: Response): Promise<void> => {
    const result = UserIdSchema.safeParse(req.params);

    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        error: z.flattenError(result.error),
      });
      return;
    }

    try {
      await this.userService.deleteById(result.data);
      res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({
          message: error.message,
        });
        return;
      }

      res.status(500).json({ message: "Error deleting user" });
    }
  }
}