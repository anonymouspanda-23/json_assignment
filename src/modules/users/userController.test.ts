import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response } from "express";
import { UserController } from "./userController.ts";
import type { UserService } from "./userService.ts";
import { NotFoundError } from "../../shared/utils/errors.ts";
import type { User } from "./user.type.ts";

// 1. Create a mock service interface using Vitest spy functions
const mockUserService: UserService = {
  getById: vi.fn(),
  add: vi.fn(),
  deleteById: vi.fn(),
};

describe("UserController", () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const validId = "c1f7b9a2-3e5d-4a18-9c2f-8d6e4b5a3c1f";

  // Use the established test data structure
  const mockUser: User = {
    id: validId,
    name: "Marcus Lim",
    email: "marcus.lim@example.com",
    phone_number: "91234567",
    deleted: false,
  };

  beforeEach(() => {
    // 2. Inject the mock service into the controller[cite: 2]
    userController = new UserController(mockUserService);

    // 3. Mock the Express Request and Response objects[cite: 2]
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(), // Allows chaining res.status().json()
      json: vi.fn(),
      send: vi.fn(),
    };

    vi.clearAllMocks();
  });

  describe("getById", () => {
    it("should return 200 and the user (excluding the deleted flag) on success", async () => {
      mockRequest.params = { id: validId };
      vi.mocked(mockUserService.getById).mockResolvedValue(mockUser);

      await userController.getById(mockRequest as Request, mockResponse as Response);

      // Verify the deleted flag was successfully destructured out of the response
      const { deleted, ...expectedResponse } = mockUser;

      expect(mockUserService.getById).toHaveBeenCalledWith(validId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
    });

    it("should return 400 if the ID parameter fails Zod validation", async () => {
      mockRequest.params = { id: "invalid-uuid" };

      await userController.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Validation failed" })
      );
      // Ensure the service was never called
      expect(mockUserService.getById).not.toHaveBeenCalled();
    });

    it("should return 404 if the service throws a NotFoundError", async () => {
      mockRequest.params = { id: validId };
      const notFoundError = new NotFoundError("User not found!");
      vi.mocked(mockUserService.getById).mockRejectedValue(notFoundError);

      await userController.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: "User not found!" });
    });

    it("should return 500 if an unknown error occurs", async () => {
      mockRequest.params = { id: validId };
      vi.mocked(mockUserService.getById).mockRejectedValue(new Error("Database offline"));

      await userController.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: "Error retrieving user" });
    });
  });

  describe("add", () => {
    const validPayload = {
      name: "Marcus Lim",
      email: "marcus.lim@example.com",
      phone_number: "91234567",
    };

    const expectedParsedPayload = {
      ...validPayload,
      deleted: false,
    };

    it("should return 201 and the newly created user on success", async () => {
      mockRequest.body = validPayload;
      vi.mocked(mockUserService.add).mockResolvedValue(mockUser);

      await userController.add(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.add).toHaveBeenCalledWith(expectedParsedPayload);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it("should return 400 if the request body fails Zod validation", async () => {
      // Missing required fields
      mockRequest.body = { email: "not-an-email" };

      await userController.add(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Validation failed" })
      );
      expect(mockUserService.add).not.toHaveBeenCalled();
    });

    it("should return 500 if an unknown error occurs during creation", async () => {
      mockRequest.body = validPayload;
      vi.mocked(mockUserService.add).mockRejectedValue(new Error("Database failed"));

      await userController.add(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: "Error adding user" });
    });
  });

  describe("deleteById", () => {
    it("should return 204 No Content on successful deletion", async () => {
      mockRequest.params = { id: validId };
      vi.mocked(mockUserService.deleteById).mockResolvedValue(undefined);

      await userController.deleteById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.deleteById).toHaveBeenCalledWith(validId);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalledTimes(1);
    });

    it("should return 400 if the ID parameter fails Zod validation", async () => {
      mockRequest.params = { id: "invalid-uuid" };

      await userController.deleteById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockUserService.deleteById).not.toHaveBeenCalled();
    });

    it("should return 404 if the service throws a NotFoundError", async () => {
      mockRequest.params = { id: validId };
      const notFoundError = new NotFoundError("User not found!");
      vi.mocked(mockUserService.deleteById).mockRejectedValue(notFoundError);

      await userController.deleteById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: "User not found!" });
    });

    it("should return 500 if an unknown error occurs during deletion", async () => {
      mockRequest.params = { id: validId };
      vi.mocked(mockUserService.deleteById).mockRejectedValue(new Error("Database failed"));

      await userController.deleteById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: "Error deleting user" });
    });
  });
});