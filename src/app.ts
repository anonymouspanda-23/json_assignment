import express, { type Express } from 'express';
import { JsonUserRepository } from "./modules/users/jsonUserRepository.ts";
import { UserServiceImpl } from "./modules/users/userServiceImpl.ts";
import { UserController } from "./modules/users/userController.ts";
import { userRoutes } from "./modules/users/userRoutes.ts";
import { requestLogger } from "./shared/middlewares/logger.ts";

const PORT = process.env.PORT || 3000;

const app: Express = express();

// Enable logging to console
app.use(requestLogger);
app.use(express.json());

try {
  const userRepository = new JsonUserRepository();
  await userRepository.initialize();

  const userService = new UserServiceImpl(userRepository);

  const userController = new UserController(userService);

  app.use("/users", userRoutes(userController));

  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
} catch (e) {
  console.error(`Failed to initialize application. Reason: ${e}`);
  process.exit(1);
}

export default app;