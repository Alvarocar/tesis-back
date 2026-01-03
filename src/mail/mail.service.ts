import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Enviar correo simple con HTML/CSS embebido
   */
  async sendSimpleEmail(to: string, subject: string, htmlContent: string) {
    await this.mailerService.sendMail({
      to,
      subject,
      html: htmlContent,
    });
  }

  /**
   * Enviar correo usando template de Handlebars
   */
  async sendTemplateEmail(to: string, subject: string, template: string, context: any) {
    await this.mailerService.sendMail({
      to,
      subject,
      template, // nombre del archivo sin extensión (ej: 'welcome')
      context, // variables para el template
    });
  }

  /**
   * Enviar correo de invitación con token para establecer contraseña
   */
  async sendInvitationEmail(email: string, name: string, token: string) {
    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password?token=${token}`;
    
    await this.sendTemplateEmail(
      email,
      'Invitación a NeuroScreen - Configura tu contraseña',
      'invitation',
      {
        name,
        invitationUrl,
        expirationHours: 24,
        year: new Date().getFullYear(),
      },
    );
  }

  /**
   * Ejemplo: Enviar correo de bienvenida a un empleado
   */
  async sendWelcomeEmail(email: string, name: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 50px auto;
              background: white;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
              color: #333;
            }
            .content h2 {
              color: #667eea;
              margin-top: 0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #6c757d;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenido a NeuroScreen</h1>
            </div>
            <div class="content">
              <h2>¡Hola ${name}!</h2>
              <p>
                Nos complace darte la bienvenida a nuestra plataforma de selección de personal.
              </p>
              <p>
                Con NeuroScreen podrás gestionar candidatos, evaluaciones y procesos de 
                contratación de forma eficiente.
              </p>
              <a href="http://localhost:3000" class="button">Acceder a la plataforma</a>
            </div>
            <div class="footer">
              <p>© 2026 NeuroScreen - Proyecto Académico</p>
              <p>Este es un correo automático, por favor no responder.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendSimpleEmail(email, 'Bienvenido a NeuroScreen', htmlContent);
  }

  /**
   * Ejemplo: Notificar sobre una nueva aplicación
   */
  async sendApplicationNotification(email: string, applicantName: string, jobTitle: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #e9ecef;
              margin: 0;
              padding: 20px;
            }
            .email-wrapper {
              max-width: 650px;
              margin: 0 auto;
              background: white;
              border-radius: 8px;
            }
            .header {
              background-color: #28a745;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .body {
              padding: 30px;
            }
            .info-box {
              background: #f8f9fa;
              border-left: 4px solid #28a745;
              padding: 15px;
              margin: 20px 0;
            }
            .info-box strong {
              color: #28a745;
            }
            .cta-button {
              display: inline-block;
              background: #28a745;
              color: white;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6c757d;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <h1>📋 Nueva Aplicación Recibida</h1>
            </div>
            <div class="body">
              <p>Hola,</p>
              <p>Se ha recibido una nueva aplicación para revisar:</p>
              
              <div class="info-box">
                <p><strong>Candidato:</strong> ${applicantName}</p>
                <p><strong>Posición:</strong> ${jobTitle}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
              </div>
              
              <p>Por favor, revisa la aplicación en la plataforma lo antes posible.</p>
              
              <a href="http://localhost:3000/applications" class="cta-button">
                Ver Aplicación
              </a>
            </div>
            <div class="footer">
              <p>NeuroScreen - Sistema de Gestión de Candidatos</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendSimpleEmail(
      email,
      `Nueva aplicación: ${applicantName} - ${jobTitle}`,
      htmlContent,
    );
  }
}
