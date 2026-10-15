import { describe, it, expect, beforeEach, vi } from "vitest";
import { JsonUserRepository } from "./jsonUserRepository.ts";
import type { User } from "./user.type.ts";
import fs from "fs/promises";

// Tell Vitest to mock the native fs/promises module
vi.mock("fs/promises");

describe("JsonUserRepository", () => {
  let repository: JsonUserRepository;
  let consoleSpy: any;

  const mockUser: User = {
    id: "c1f7b9a2-3e5d-4a18-9c2f-8d6e4b5a3c1f", // UUID v4 format
    name: "Marcus Lim",
    email: "marcus.lim@example.com",
    phone_number: "91234567",
    deleted: false,
  };

  beforeEach(() => {
    repository = new JsonUserRepository();
    vi.clearAllMocks();

    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("initialize", () => {
    it("should parse and load users into memory if the file read is successful", async () => {
      // Simulate the JSON file containing an array with our mock user
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([mockUser]));

      await repository.initialize();

      expect(fs.readFile).toHaveBeenCalledTimes(1);

      // Verify the data was successfully loaded into memory
      const user = await repository.getById(mockUser.id);
      expect(user).toEqual(mockUser);
    });

    it("should catch the error, log it, and initialize an empty list if file read fails", async () => {
      const mockError = new Error("File missing");
      vi.mocked(fs.readFile).mockRejectedValue(mockError);

      await repository.initialize();

      expect(fs.readFile).toHaveBeenCalledTimes(1);

      // Verify lines 19-20 executed correctly
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load users from JSON, initializing empty list. Reason: ",
        mockError
      );

      // Verify the memory array safely fell back to an empty list
      const user = await repository.getById(mockUser.id);
      expect(user).toBeUndefined();
    });
  });

  describe("add", () => {
    it("should successfully add a user and write to disk", async () => {
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      const result = await repository.add(mockUser);

      expect(result).toEqual(mockUser);
      expect(fs.writeFile).toHaveBeenCalledTimes(1);

      const user = await repository.getById(mockUser.id);
      expect(user).toBeDefined();
    });

    it("should rollback memory by ID and throw an error if disk write fails", async () => {
      vi.mocked(fs.writeFile).mockRejectedValue(new Error("Permission denied"));

      // Expect the exact "Database failed" error your repository throws[cite: 1]
      await expect(repository.add(mockUser)).rejects.toThrow("Database failed");

      // Validates the filter logic successfully removed the user by their ID
      const user = await repository.getById(mockUser.id);
      expect(user).toBeUndefined();
    });
  });

  describe("deleteById", () => {
    it("should soft delete a target user while leaving other users intact", async () => {
      const mockUser2: User = {
        id: "a8d2c4e6-9b1f-4d3a-8c5e-7f1a2b3c4d5e", //[cite: 1]
        name: "Nurul Aminah", //[cite: 1]
        email: "nurul.aminah@example.com", //[cite: 1]
        phone_number: "87654321", //[cite: 1]
        deleted: false,
      };

      // Add BOTH users to the in-memory array
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      await repository.add(mockUser);
      await repository.add(mockUser2);
      vi.clearAllMocks();

      // Act: Delete only the first user
      await repository.deleteById(mockUser.id);

      expect(fs.writeFile).toHaveBeenCalledTimes(1);

      // Assert: The target user hit the TRUE branch and was soft-deleted
      const deletedUser = await repository.getById(mockUser.id);
      expect(deletedUser?.deleted).toBe(true);

      // Assert: The second user hit the FALSE branch and remains completely untouched
      const untouchedUser = await repository.getById(mockUser2.id);
      expect(untouchedUser?.deleted).toBe(false);
    });

    it("should restore the array snapshot if disk write fails during deletion", async () => {
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      await repository.add(mockUser);
      vi.clearAllMocks();

      const mockError = new Error("Permission denied");
      vi.mocked(fs.writeFile).mockRejectedValue(mockError);

      await expect(repository.deleteById(mockUser.id)).rejects.toThrow("Database failed");

      // Verify the rollback executed
      const user = await repository.getById(mockUser.id);
      expect(user?.deleted).toBe(false);

      // Verify the catch block successfully logged the infrastructure failure
      expect(consoleSpy).toHaveBeenCalledWith(
        `Failed to delete user with ID ${mockUser.id}: `,
        mockError
      );
    });
  });
});