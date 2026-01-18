import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ParseIntPipe } from 'src/shared/pipes/parse-int-id.pipe';
import { Patch } from '@nestjs/common';
import { Roles } from 'src/shared/constants/metadata.constant';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { VacancyService } from './vacancy.service';
import { Role } from 'src/shared/enums/role.enum';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { VacancyFilterDto } from './dto/vacancy-filter.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { TokenDto } from 'src/shared/security/dto/token.dto';

@Controller('v1/vacancy')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  @Post()
  @Roles(Role.Admin, Role.Employee)
  @HttpCode(201)
  create(@Body() vacant: CreateVacancyDto, @CurrentUser() user: TokenDto) {
    return this.vacancyService.create(vacant, user);
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
    @CurrentUser() user: TokenDto,
  ) {
    return this.vacancyService.update(id, updateVacancyDto, user);
  }

  @Patch('/:id/archive')
  @Roles(Role.Admin, Role.Employee)
  @HttpCode(204)
  async archiveVacancy(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: TokenDto,
  ) {
    return this.vacancyService.archiveVacancy(id, user);
  }

  @Get('/')
  @Roles(Role.Employee, Role.Admin)
  @HttpCode(200)
  async getVacantsByEmployee(
    @Query() filter: VacancyFilterDto,
    @CurrentUser() user: TokenDto,
  ) {
    const { page = 1, pageSize = 10, q }: VacancyFilterDto = filter;
    const [result, count] = await this.vacancyService.findAll(
      { page, pageSize, q },
      user,
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
    @CurrentUser() user: TokenDto,
  ) {
    const [result, count] =
      await this.vacancyService.findCompletedAndArchivedVacancies(
        { page, pageSize },
        user,
      );
    return {
      result,
      currentPage: page,
      totalPages: Math.ceil(count / pageSize),
    };
  }
}
