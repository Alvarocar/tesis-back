import { BaseListener } from './base.listener';

export class ApplicationListener extends BaseListener {
  topic = 'applicant.apply';

  handleMessage(msg: string): void {
    console.log(`[ApplicantApplyListener] Recibido: ${msg}`);
    // Aquí puedes agregar la lógica específica para manejar el mensaje
  }
}
