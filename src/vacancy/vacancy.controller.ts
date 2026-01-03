import { Body, Controller, Get, HttpCode, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import type { RequestWithUser } from 'src/shared/types/request-with-user';
import { TokenGuard } from 'src/shared/security/guards/token.guard';
import { ParseIntIdPipe } from 'src/shared/pipes/parse-int-id.pipe';
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
  @UseGuards(TokenGuard)
  @HttpCode(201)
  create(@Body() vacant: CreateVacancyDto, @Req() req: RequestWithUser) {
    return this.vacancyService.create(vacant, req.user);
  }

  @Get('/:id')
  @Roles(Role.Admin, Role.Employee)
  @UseGuards(TokenGuard)
  @HttpCode(200)
  getOne(@Param('id', ParseIntIdPipe) id: number) {
    return this.vacancyService.findOne(id);
  }

  @Put('/:id')
  @Roles(Role.Admin, Role.Employee)
  @UseGuards(TokenGuard)
  @HttpCode(204)
  update(
    @Param('id', ParseIntIdPipe) id: number,
    @Body() updateVacancyDto: UpdateVacancyDto,
    @Req() req: RequestWithUser,
  ) {
    return this.vacancyService.update(id, updateVacancyDto, req.user);
  }

  
  @Get('/')
  @Roles(Role.Employee, Role.Admin)
  @UseGuards(TokenGuard)
  @HttpCode(200)
  async getVacantsByEmployee(
    @Query() filter: VacancyFilterDto,
    @Req() req: RequestWithUser,
  ) {
    return this.vacancyService.findAll(filter, req.user);
  }
}
