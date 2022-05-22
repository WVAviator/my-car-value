import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { User } from "./user.entity";
import { UsersService } from "./users.service";

describe("UsersService", () => {
	let usersService: UsersService;
	let dataSource: DataSource;
	let usersRepository: Repository<User>;

	beforeEach(async () => {
		dataSource = new DataSource({
			type: "sqlite",
			database: "usertest.sqlite",
			entities: [User],
			synchronize: true,
		});
		await dataSource.initialize();

		usersRepository = dataSource.getRepository(User);

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: getRepositoryToken(User),
					useValue: usersRepository,
				},
			],
		}).compile();

		usersService = module.get<UsersService>(UsersService);
	});

	afterEach(async () => {
		usersRepository.clear();
	});

	it("should be defined", () => {
		expect(usersService).toBeDefined();
	});

	it("creates and saves a new user", async () => {
		const email = "test@test.com";
		const user = await usersService.create(email, "test");
		expect(user.email).toBe(email);
		const queryUser = await usersRepository.findOne({ where: { email } });
		expect(queryUser.email).toEqual(email);
	});

	it("finds a user by id", async () => {
		const user = await usersService.create("test@test.com", "test");
		const foundUser = await usersService.findOne(user.id);
		expect(foundUser).toBeDefined();
	});

	it("finds all users by email", async () => {
		await usersService.create("test1@test.com", "test");
		await usersService.create("test2@test.com", "test");
		const users = await usersService.find("test1@test.com");
		expect(users.length).toBe(1);
	});

	it("updates a user correctly", async () => {
		const user = await usersService.create("test@test.com", "test");
		await usersService.update(user.id, { email: "updated@test.com" });
		const updatedUser = await usersRepository.findOne({
			where: { id: user.id },
		});
		expect(updatedUser.email).toEqual("updated@test.com");
	});

	it("deletes a user", async () => {
		const user = await usersService.create("test@test.com", "test");
		await usersService.remove(user.id);
		const deletedUser = await usersRepository.findOne({
			where: { id: user.id },
		});
		expect(deletedUser).toBeNull();
	});

	it("throws an error when trying to delete or update a non-existing user", async () => {
		const user = await usersService.create("test@test.com", "test");
		await expect(usersService.remove(user.id + 1)).rejects.toThrow();
		await expect(
			usersService.update(user.id + 1, { email: "a@a.com" })
		).rejects.toThrow();
	});
});
