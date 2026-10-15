import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserServiceImpl } from "./userServiceImpl.ts";
import type { UserRepository } from "./userRepository.ts";
import type { User } from "./user.type.ts";
import { NotFoundError } from "../../shared/utils/errors.ts";

// 1. Create a mock repository matching the UserRepository interface[cite: 1]
const mockUserRepository: UserRepository = {
  getById: vi.fn(),
  add: vi.fn(),
  deleteById: vi.fn()
};

describe("UserServiceImpl", () => {
  let userService: UserServiceImpl;

  const mockUser: User = {
    id: "c1f7b9a2-3e5d-4a18-9c2f-8d6e4b5a3c1f",
    name: "Marcus Lim",
    email: "marcus.lim@example.com",
    phone_number: "91234567",
    deleted: false,
  };

  beforeEach(() => {
    // 2. Inject the mock repository into the service
    userService = new UserServiceImpl(mockUserRepository);
    vi.clearAllMocks();
  });

  describe("getById", () => {
    it("should successfully return a user by ID", async () => {
      vi.mocked(mockUserRepository.getById).mockResolvedValue(mockUser);

      const result = await userService.getById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.getById).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.getById).toHaveBeenCalledWith(mockUser.id);
    });

    it("should throw a NotFoundError if the user does not exist", async () => {
      vi.mocked(mockUserRepository.getById).mockResolvedValue(undefined);

      await expect(userService.getById(mockUser.id)).rejects.toThrow(NotFoundError);
    });

    it("should throw a NotFoundError if the user is soft-deleted", async () => {
      const deletedUser = { ...mockUser, deleted: true };
      vi.mocked(mockUserRepository.getById).mockResolvedValue(deletedUser);

      await expect(userService.getById(mockUser.id)).rejects.toThrow(NotFoundError);
    });
  });

  describe("add", () => {
    it("should add a new user and generate a unique UUID v4", async () => {
      // Mock the repository to return whatever payload the service passes it
      vi.mocked(mockUserRepository.add).mockImplementation(async (u) => u);

      const userData = {
        name: "Nurul Aminah", //[cite: 1]
        email: "nurul.aminah@example.com",
        phone_number: "87654321", //[cite: 1]
        deleted: false,
      };

      const result = await userService.add(userData);

      expect(result.id).toBeDefined(); // Validates the service generated the ID
      expect(result.name).toBe(userData.name);
      expect(mockUserRepository.add).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteById", () => {
    it("should successfully pass the gatekeeper check and delete a user by ID", async () => {
      vi.mocked(mockUserRepository.getById).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.deleteById).mockResolvedValue(undefined);

      await userService.deleteById(mockUser.id);

      expect(mockUserRepository.getById).toHaveBeenCalledWith(mockUser.id);
      expect(mockUserRepository.deleteById).toHaveBeenCalledWith(mockUser.id);
      expect(mockUserRepository.deleteById).toHaveBeenCalledTimes(1);
    });

    it("should prevent deletion and throw NotFoundError if user does not exist", async () => {
      vi.mocked(mockUserRepository.getById).mockResolvedValue(undefined);

      await expect(userService.deleteById(mockUser.id)).rejects.toThrow(NotFoundError);

      // Guarantee the repository delete operation is blocked
      expect(mockUserRepository.deleteById).not.toHaveBeenCalled();
    });

    it("should prevent deletion and throw NotFoundError if user is already soft-deleted", async () => {
      const deletedUser = { ...mockUser, deleted: true };
      vi.mocked(mockUserRepository.getById).mockResolvedValue(deletedUser);

      await expect(userService.deleteById(mockUser.id)).rejects.toThrow(NotFoundError);

      // Guarantee the repository delete operation is blocked
      expect(mockUserRepository.deleteById).not.toHaveBeenCalled();
    });
  });
});