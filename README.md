### Express.js User Management API

A simple backend application built with Express.js and TypeScript. This project demonstrates a robust, feature-based modular architecture using dependency injection.

### Tech Stack
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Zod
- **Package Manager**: pnpm
- **Database**: Data is stored locally in a users.json file instead of an external database

### Architecture

The codebase is organized using vertical slicing. Everything related to a specific domain lives in one self-contained directory.

The application strictly separates concerns using dependency injection:

- **Repository Layer**: Handles raw data operations and manages file system I/O.
- **Service Layer**: Orchestrates business rules, such as enforcing uniqueness and checking for soft-deleted records.
- **Controller Layer**: Extracts data from HTTP requests, passes it to the service, and formats the HTTP responses.

### Directory Structure
```text
json_assignment/
├── src/
│   ├── modules/
│   │   └── users/
│   │       ├── jsonUserRepository.test.ts   # Repository implementation unit tests
│   │       ├── jsonUserRepository.ts        # Repository implementation
│   │       ├── user.type.ts                 # Zod schemas and TypeScript types
│   │       ├── userController.test.ts       # HTTP logic unit tests
│   │       ├── userController.ts            # HTTP logic
│   │       ├── userRepository.ts            # Repository interface
│   │       ├── userRoutes.ts                # Endpoint mapping
│   │       ├── users.json                   # Local data source
│   │       ├── userService.test.ts          # Business logic implementation tests
│   │       ├── userService.ts               # Business logic interface
│   │       ├── userServiceImpl.ts           # Business logic implementation
│   │       └── *.test.ts                    # Co-located unit tests
│   ├── shared/
│   │   ├── middlewares/                
│   │   │   └── logger.ts                    # Native request logger
│   │   └── utils/                      
│   │       └── errors.ts                    # Custom error classes
│   └── app.ts                               # Composition root and application bootstrap
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── vercel.json                              # Vercel deployment configuration
```

### Features
- **Soft Deleting**: Users are not permanently removed from the file. Instead, a deleted flag is toggled to true.
- **Strict Validation**: Zod ensures that incoming data contains a valid name, email, and a Singapore-formatted phone number.
- **UUID Implementation**: A UUID v4 is automatically generated and attached as the primary identifier for new users.
- **Fail-Fast Initialization**: The data source is initialized before the Express server accepts any incoming requests.

### Getting Started
#### Installation
Install the required dependencies securely using the lockfile:

```shell
pnpm install --frozen-lockfile
```

#### Running the Server
- **Development Mode**: Run `pnpm run dev` to start the server using `tsx` for hot-reloading.
- **Production Build**: Run `pnpm run build` to compile the TypeScript code, followed by `pnpm start` to run the compiled application.

#### Testing

This project co-locates unit tests directly alongside the implementations they are testing. Execute the test suite using the following command:

```shell
pnpm test
```