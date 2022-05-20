import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
	@IsString()
	@IsOptional()
	@IsEmail()
	email: string;

	@IsString()
	@IsOptional()
	password: string;
}
