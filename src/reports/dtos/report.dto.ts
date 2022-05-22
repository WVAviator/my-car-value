import { Expose, Transform } from "class-transformer";

export class ReportDto {
	@Expose()
	id: number;
	@Expose()
	price: number;
	@Expose()
	year: number;
	@Expose()
	make: string;
	@Expose()
	model: string;
	@Expose()
	latitude: number;
	@Expose()
	longitude: number;
	@Expose()
	mileage: number;

	@Transform(({ obj }) => obj.user.id)
	@Expose()
	userId: number;
}
