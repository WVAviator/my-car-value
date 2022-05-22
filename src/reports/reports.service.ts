import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/user.entity";
import { Repository } from "typeorm";
import { CreateReportDto } from "./dtos/create-report.dto";
import { Report } from "./report.entity";
import { GetEstimateDto } from "./dtos/get-estimate.dto";

@Injectable()
export class ReportsService {
	constructor(
		@InjectRepository(Report) private reportsRepository: Repository<Report>
	) {}

	async create(reportDto: CreateReportDto, user: User) {
		const report = this.reportsRepository.create(reportDto);
		report.user = user;
		return this.reportsRepository.save(report);
	}

	async changeApproval(id: number, approved: boolean) {
		const report = await this.reportsRepository.findOne({ where: { id } });
		if (!report) {
			throw new NotFoundException("Report not found.");
		}
		report.approved = approved;
		return this.reportsRepository.save(report);
	}

	async getEstimate(query: GetEstimateDto) {
		const { make, model, year, mileage, latitude, longitude } = query;
		const estimate = await this.reportsRepository
			.createQueryBuilder("estimate")
			.select("AVG(price)", "price")
			.where("make = :make", { make })
			.andWhere("model = :model", { model })
			.andWhere("year BETWEEN :year - 3 AND :year + 3", { year })
			.andWhere("latitude BETWEEN :latitude - 5 AND :latitude + 5", {
				latitude,
			})
			.andWhere("longitude BETWEEN :longitude - 5 AND :longitude + 5", {
				longitude,
			})
			.andWhere("approved IS TRUE")
			.orderBy("ABS(mileage - :mileage)", "DESC")
			.setParameters({ mileage })
			.limit(3)
			.getRawOne();
		return estimate;
	}
}
