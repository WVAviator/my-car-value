import { UsersService } from "./users.service";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService) {}

	async signup(email: string, password: string) {
		const users = await this.usersService.find(email);
		if (users.length > 0) {
			throw new BadRequestException("Email in use");
		}

		const salt = randomBytes(8).toString("hex");
		const hash = (await scrypt(password, salt, 32)) as Buffer;

		const result = salt + "." + hash.toString("hex");

		const newUser = await this.usersService.create(email, result);
		return newUser;
	}

	async signin(email: string, password: string) {
		const [user] = await this.usersService.find(email);
		if (!user) {
			throw new NotFoundException("Invalid email");
		}

		const [salt, storedHash] = user.password.split(".");
		const hash = (await scrypt(password, salt, 32)) as Buffer;

		if (hash.toString("hex") !== storedHash) {
			throw new NotFoundException("Invalid password");
		}
		return user;
	}
}
