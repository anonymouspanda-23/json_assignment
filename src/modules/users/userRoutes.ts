import { Router } from "express";
import { UserController } from "./userController.ts";

export function userRoutes(userController: UserController) {
  const router = Router();

  router.post('/', userController.add);
  router.get('/:id', userController.getById);
  router.delete('/:id', userController.deleteById);

  return router;
}