import { AwsClient } from 'aws4fetch'

interface SESConfig {
  region: string
  accessKeyId: string
  secretAccessKey: string
  fromEmail: string
}

interface EmailParams {
  to: string
  subject: string
  bodyText: string
  bodyHtml: string
}

export class EmailSendError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'EmailSendError'
  }
}

export function getSESConfig(env: Env): SESConfig {
  return {
    region: env.SES_AWS_REGION,
    accessKeyId: env.SES_ACCESS_KEY_ID,
    secretAccessKey: env.SES_SECRET_ACCESS_KEY,
    fromEmail: env.SES_FROM_EMAIL,
  }
}

export async function sendEmail(params: EmailParams, config: SESConfig) {
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
    service: 'ses',
  })

  const body = new URLSearchParams({
    Action: 'SendEmail',
    'Destination.ToAddresses.member.1': params.to,
    'Message.Subject.Data': params.subject,
    'Message.Body.Text.Data': params.bodyText,
    'Message.Body.Html.Data': params.bodyHtml,
    Source: config.fromEmail,
  })

  const response = await client.fetch(
    `https://email.${config.region}.amazonaws.com/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new EmailSendError(`SES error: ${text}`, response.status)
  }
}

export function buildInviteEmail({
  inviterEmail,
  roomName,
  role,
  inviteUrl,
}: {
  inviterEmail: string
  roomName: string
  role: string
  inviteUrl: string
}) {
  const subject = `You've been invited to "${roomName}"`

  const bodyText = [
    `${inviterEmail} has invited you to join "${roomName}" as a ${role}.`,
    '',
    `Accept the invitation: ${inviteUrl}`,
    '',
    'This invitation expires in 7 days.',
  ].join('\n')

  const bodyHtml = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>You've been invited to a data room</h2>
      <p><strong>${inviterEmail}</strong> has invited you to join <strong>${roomName}</strong> as a <strong>${role}</strong>.</p>
      <p style="margin: 24px 0;">
        <a href="${inviteUrl}" style="background: #0f172a; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">
          Accept Invitation
        </a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">This invitation expires in 7 days.</p>
    </div>
  `.trim()

  return { subject, bodyText, bodyHtml }
}
