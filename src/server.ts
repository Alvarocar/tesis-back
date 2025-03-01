import App from '@/app';
import { AuthController } from '@controllers/auth.controller';
import { IndexController } from '@controllers/index.controller';
import { UsersController } from '@controllers/users.controller';
import validateEnv from '@utils/validateEnv';
import { ApplicantController } from './controllers/applicant.controller';
import { RecruiterController } from './controllers/recluter.controller';
import { ResumeController } from './controllers/resume.controller';
import { JobController } from './controllers/job.controller';
import { ApplicantionController } from './controllers/application.controller';
import { LanguageController } from './controllers/language.controller';
import { VacantController } from './controllers/vacant.controller';

validateEnv();

const app = new App([
  AuthController,
  IndexController,
  UsersController,
  ApplicantController,
  ResumeController,
  JobController,
  ApplicantionController,
  LanguageController,
  RecruiterController,
  VacantController,
]);
app.listen();
