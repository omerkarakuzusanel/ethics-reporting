import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// SendGrid API anahtarını environment variable'dan alıyoruz
const SENDGRID_API_KEY = process.env.NEXT_PUBLIC_SENDGRID_API_KEY;
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const NOTIF_EMAIL_1 = process.env.NEXT_PUBLIC_NOTIF_EMAIL_1;
const NOTIF_EMAIL_2 = process.env.NEXT_PUBLIC_NOTIF_EMAIL_2;
const NOTIF_EMAIL_3 = process.env.NEXT_PUBLIC_NOTIF_EMAIL_3;


// API anahtarı ve e-posta adresi kontrolü
if (!SENDGRID_API_KEY) {
  console.error('NEXT_PUBLIC_SENDGRID_API_KEY bulunamadı');
}

if (!ADMIN_EMAIL) {
  console.error('NEXT_PUBLIC_ADMIN_EMAIL bulunamadı');
}

if (!APP_URL) {
  console.error('NEXT_PUBLIC_APP_URL bulunamadı');
}

// SendGrid'i yapılandırıyoruz
sgMail.setApiKey(SENDGRID_API_KEY || '');

// E-posta şablonunu önceden hazırla
const createEmailTemplate = (data: {
  reportId: string | null;
  accessCode: string;
  description: string;
  location: string;
  date: string;
  name?: string;
  email?: string;
  phone?: string;
  fileCount: number;
}) => {
  const {
    reportId,
    accessCode,
    description,
    location,
    date,
    name,
    email,
    phone,
    fileCount
  } = data;

  const formattedDate = new Date(date).toLocaleDateString('tr-TR');
  const reportUrl = reportId 
    ? `${APP_URL}/admin/reports/${reportId}`
    : `${APP_URL}/track-report?code=${accessCode}`;

  return {
    to: [
        NOTIF_EMAIL_1,
        NOTIF_EMAIL_2,
        NOTIF_EMAIL_3
      ],
    from: ADMIN_EMAIL,
    subject: 'Yeni Etik İhlal Bildirimi',
    text: `
      Yeni bir etik ihlal bildirimi alındı.
      
      Bildirim Detayları:
      - Bildirim ID: ${reportId || 'Henüz oluşturulmadı'}
      - Erişim Kodu: ${accessCode}
      - Olay Tarihi: ${formattedDate}
      - Konum: ${location}
      - Yüklenen Dosya Sayısı: ${fileCount}
      
      ${name ? `Bildiren: ${name}` : 'Anonim Bildirim'}
      ${email ? `E-posta: ${email}` : ''}
      ${phone ? `Telefon: ${phone}` : ''}
      
      Açıklama:
      ${description}
      
      Bildirimi görüntülemek için: ${reportUrl}
    `,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sanel | Yeni Etik Bildirimi</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border:1px solid #e0e0e0; margin:40px auto;">
          <!-- Header -->
          <tr>
            <td style="padding:24px; background-color:#f2f2f2; text-align:center; border-bottom:1px solid #dddddd;">
              <h1 style="margin:0; font-size:20px; color:#333333;">Yeni Etik Bildirimi</h1>
            </td>
          </tr>

          <!-- Info Section -->
          <tr>
            <td style="padding:24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0; font-size:14px; color:#666;">Bildirim No:</td>
                  <td style="padding:6px 0; font-size:14px; color:#333;"><strong>#${reportId || 'Henüz oluşturulmadı'}</strong></td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:14px; color:#666;">Durum:</td>
                  <td style="padding:6px 0; font-size:14px; color:#333;">Yeni</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:14px; color:#666;">Tarih:</td>
                  <td style="padding:6px 0; font-size:14px; color:#333;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:14px; color:#666;">Konum:</td>
                  <td style="padding:6px 0; font-size:14px; color:#333;">${location}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-size:14px; color:#666;">Erişim Kodu:</td>
                  <td style="padding:6px 0; font-size:14px; color:#333;">${accessCode}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Description -->
          <tr>
            <td style="padding:24px;">
              <h3 style="font-size:16px; color:#333; margin:0 0 10px;">Bildirim İçeriği</h3>
              <p style="font-size:14px; color:#333; line-height:1.6; white-space:pre-wrap;">${description}</p>

              ${(name || email || phone) ? `
              <div style="margin-top:16px; padding:12px; background-color:#f9f9f9; border:1px solid #e0e0e0;">
                ${name ? `<p style="margin:6px 0; font-size:13px; color:#555;"><strong>Bildiren:</strong> ${name}</p>` : ''}
                ${email ? `<p style="margin:6px 0; font-size:13px; color:#555;"><strong>E-posta:</strong> ${email}</p>` : ''}
                ${phone ? `<p style="margin:6px 0; font-size:13px; color:#555;"><strong>Telefon:</strong> ${phone}</p>` : ''}
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td style="padding:24px; text-align:center;">
              <a href="${reportUrl}" style="display:inline-block; background-color:#333; color:#ffffff; text-decoration:none; padding:10px 20px; font-size:14px; border-radius:4px;">Bildirimi İncele</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px; background-color:#f2f2f2; text-align:center; font-size:12px; color:#888;">
              <p style="margin:4px 0;">Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.</p>
              <p style="margin:4px 0;">© ${new Date().getFullYear()} Sanel | Etik Bildirim Sistemi</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`,
  };
};

export async function POST(request: Request) {
  try {
    const { report, accessCode } = await request.json();

    if (!report || !accessCode) {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }

    if (!SENDGRID_API_KEY || !ADMIN_EMAIL || !APP_URL) {
      return NextResponse.json(
        { error: 'E-posta yapılandırması eksik' },
        { status: 500 }
      );
    }

    // Report nesnesinin gerekli alanlarını kontrol et
    const requiredFields = ['id', 'description', 'location', 'created_at'];
    const missingFields = requiredFields.filter(field => !report[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Eksik alanlar',
          details: `Eksik alanlar: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    const msg = {
      to: [
        NOTIF_EMAIL_1,
        NOTIF_EMAIL_2,
        NOTIF_EMAIL_3
      ],
      from: {
        email: ADMIN_EMAIL,
        name: 'Sanel | Etik Bildirim Sistemi'
      },
      subject: 'Sanel | Yeni Etik Bildirimi',
      html: createEmailTemplate({
        reportId: report.id,
        accessCode,
        description: report.description,
        location: report.location,
        date: report.created_at,
        name: report.name || undefined,
        email: report.email || undefined,
        phone: report.phone || undefined,
        fileCount: report.report_files?.length || 0
      }).html
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('E-posta gönderimi başarısız:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'E-posta gönderimi başarısız oldu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      }, 
      { status: 500 }
    );
  }
} 