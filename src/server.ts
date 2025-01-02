import App from '@/app';
import { AuthController } from '@controllers/auth.controller';
import { IndexController } from '@controllers/index.controller';
import { UsersController } from '@controllers/users.controller';
import validateEnv from '@utils/validateEnv';
import { ApplicantController } from './controllers/applicant.controller';
import { RecluterController } from './controllers/recluter.controller';
import { ResumeController } from './controllers/resume.controller';
import { JobController } from './controllers/job.controller';
import { ApplicantionController } from './controllers/application.controller';

validateEnv();

const app = new App([
  AuthController,
  IndexController,
  UsersController,
  ApplicantController,
  RecluterController,
  ResumeController,
  JobController,
  ApplicantionController,
]);
app.listen();
