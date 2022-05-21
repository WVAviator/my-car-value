import { BadRequestException, NotFoundException } from "@nestjs/common";
import { User } from "./user.entity";
import { UsersService } from "./users.service";
import { AuthService } from "./auth.service";
import { Test } from "@nestjs/testing";

describe("AuthService", () => {
	let authService: AuthService;
	let fakeUsersService: Partial<UsersService>;

	beforeEach(async () => {
		const users: User[] = [];
		fakeUsersService = {
			find: (email) => {
				const filteredUsers = users.filter(
					(user) => user.email === email
				);
				return Promise.resolve(filteredUsers);
			},
			create: (email: string, password: string) => {
				const newUser = {
					id: Math.floor(Math.random() * 99999),
					email,
					password,
				} as User;
				users.push(newUser);
				return Promise.resolve(newUser);
			},
		};

		const module = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UsersService,
					useValue: fakeUsersService,
				},
			],
		}).compile();

		authService = module.get<AuthService>(AuthService);
	});

	it("can create an instance of auth service", async () => {
		expect(authService).toBeDefined();
	});

	it("creates a new user with a salted and hashed password", async () => {
		const user = await authService.signup("a@a.com", "asdf");
		expect(user.password).not.toEqual("asdf");
		const [salt, hash] = user.password.split(".");
		expect(salt).toBeDefined();
		expect(hash).toBeDefined();
	});

	it("throws an error if user signs up with email that is in use", async () => {
		await authService.signup("asdf@asdf.com", "asdf");

		expect.assertions(1);
		try {
			await authService.signup("asdf@asdf.com", "asdf");
		} catch (e) {
			expect(e).toBeInstanceOf(BadRequestException);
		}
	});

	it("throws if signin is called with an unused email", async () => {
		expect.assertions(2);
		try {
			await authService.signin("asdf@s.com", "asdf");
		} catch (e) {
			expect(e).toBeInstanceOf(NotFoundException);
			expect(e.message).toBe("Invalid email");
		}
	});

	it("throws if signin is called with an incorrect password", async () => {
		await authService.signup("asdf@asdf.com", "asdf");

		expect.assertions(2);
		try {
			await authService.signin("asdf@asdf.com", "qwer");
		} catch (e) {
			expect(e).toBeInstanceOf(NotFoundException);
			expect(e.message).toBe("Invalid password");
		}
	});

	it("returns a user if correct password is provided", async () => {
		await authService.signup("asdf@asdf.com", "asdf");
		const user = await authService.signin("asdf@asdf.com", "asdf");
		expect(user).toBeDefined();
	});
});
