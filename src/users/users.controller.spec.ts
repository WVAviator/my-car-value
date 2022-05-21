import { AuthService } from "./auth.service";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { NotFoundException } from "@nestjs/common";

describe("UsersController", () => {
	let controller: UsersController;
	let fakeUsersService: Partial<UsersService>;
	let fakeAuthService: Partial<AuthService>;

	beforeEach(async () => {
		fakeUsersService = {
			findOne: (id: number) => {
				return Promise.resolve({
					id: id,
					email: "asdf@asdf.com",
				} as User);
			},
			find: (email: string) => {
				return Promise.resolve([
					{
						id: 1,
						email,
					} as User,
				]);
			},
		};
		fakeAuthService = {
			signin: (email, password) => {
				return Promise.resolve({ id: 1, email, password } as User);
			},
		};
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: fakeUsersService,
				},
				{
					provide: AuthService,
					useValue: fakeAuthService,
				},
			],
		}).compile();

		controller = module.get<UsersController>(UsersController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	it("findAllUsers returns a list of users with the given email", async () => {
		const users = await controller.findAllUsers("asdf@asdf.com");
		expect(users).toHaveLength(1);
		expect(users[0].email).toBe("asdf@asdf.com");
	});

	it("findUser returns a user with the given id", async () => {
		const user = await controller.findUser("1");
		expect(user).toBeDefined();
	});

	it("findUser throws an error if user not found", async () => {
		fakeUsersService.findOne = () => null;

		expect.assertions(2);
		try {
			await controller.findUser("2");
		} catch (e) {
			expect(e).toBeInstanceOf(NotFoundException);
			expect(e.message).toBe("User with id 2 not found");
		}
	});

	it("signIn updates session object and returns user", async () => {
		const session = {};
		const user = await controller.signin(
			{ email: "asdf@asdf.com", password: "asdf" },
			session
		);
		expect(user.id).toEqual(1);
		expect(session).toHaveProperty("userId", 1);
	});
});
