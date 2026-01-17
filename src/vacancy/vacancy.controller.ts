import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import type { RequestWithUser } from 'src/shared/types/request-with-user';
import { ParseIntPipe } from 'src/shared/pipes/parse-int-id.pipe';
import { Roles } from 'src/shared/constants/metadata.constant';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { VacancyService } from './vacancy.service';
import { Role } from 'src/shared/enums/role.enum';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { VacancyFilterDto } from './dto/vacancy-filter.dto';

@Controller('v1/vacancy')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  @Post()
  @Roles(Role.Admin, Role.Employee)
  @HttpCode(201)
  create(@Body() vacant: CreateVacancyDto, @Req() req: RequestWithUser) {
    return this.vacancyService.create(vacant, req.user);
  }

  @Get('/:id')
  @Roles(Role.Admin, Role.Employee)
  @HttpCode(200)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.vacancyService.findOne(id);
  }

  @Put('/:id')
  @Roles(Role.Admin, Role.Employee)
  @HttpCode(204)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVacancyDto: UpdateVacancyDto,
    @Req() req: RequestWithUser,
  ) {
    return this.vacancyService.update(id, updateVacancyDto, req.user);
  }

  @Get('/')
  @Roles(Role.Employee, Role.Admin)
  @HttpCode(200)
  async getVacantsByEmployee(
    @Query() filter: VacancyFilterDto,
    @Req() req: RequestWithUser,
  ) {
    const { page = 1, pageSize = 10, q }: VacancyFilterDto = filter;
    const [result, count] = await this.vacancyService.findAll(
      { page, pageSize, q },
      req.user,
    );
    return {
      result,
      currentPage: page,
      totalPages: Math.ceil(count / pageSize),
    };
  }

  @Get('/completed-and-archived')
  @Roles(Role.Employee, Role.Admin)
  @HttpCode(200)
  async getCompletedAndArchivedVacancies(
    @Query('page', ParseIntPipe) page = 1,
    @Query('pageSize', ParseIntPipe) pageSize = 10,
    @Req() req: RequestWithUser,
  ) {
    const [result, count] =
      await this.vacancyService.findCompletedAndArchivedVacancies(
        { page, pageSize },
        req.user,
      );
    return {
      result,
      currentPage: page,
      totalPages: Math.ceil(count / pageSize),
    };
  }
}
