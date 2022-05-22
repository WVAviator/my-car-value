import { GetEstimateDto } from "./dtos/get-estimate.dto";
import { User } from "../users/user.entity";
import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { CreateReportDto } from "./dtos/create-report.dto";
import { ReportsService } from "./reports.service";
import { Serialize } from "../interceptors/serialize.interceptor";
import { ReportDto } from "./dtos/report.dto";
import { ApproveReportDto } from "./dtos/approve-report.dto";
import { AdminGuard } from "../guards/admin.guard";

@Controller("reports")
export class ReportsController {
	constructor(private reportsService: ReportsService) {}

	@UseGuards(AuthGuard)
	@Post("/create")
	@Serialize(ReportDto)
	createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
		return this.reportsService.create(body, user);
	}

	@UseGuards(AdminGuard)
	@Patch("/approve/:id")
	async approveReport(
		@Param("id") id: number,
		@Body() body: ApproveReportDto
	) {
		return this.reportsService.changeApproval(id, body.approved);
	}

	@Get("/estimate")
	async getEstimate(@Query() query: GetEstimateDto) {
		return this.reportsService.getEstimate(query);
	}
}
