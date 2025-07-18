import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Generate a random access code
const generateAccessCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// Create a new report
export async function createReport(data: {
  description: string;
  location: string;
  date: string;
  identityOption: string;
  connectionOption: string;
  connectionOther: string;
  name: string;
  email: string;
  phone: string;
  files?: {
    fileUrl: string;
    fileName: string;
    fileUploaderName: string | null;
    fileUploaderEmail: string | null;
  }[];
}) {
  try {
    const accessCode = generateAccessCode();

    // Önce raporu oluştur
    const reportResult = await supabase
      .from("reports")
      .insert({
        description: data.description,
        location: data.location,
        date: data.date,
        identity_option: data.identityOption,
        connection_option: data.connectionOption,
        name: data.name || null,
        email: data.email || null,
        phone: data.phone || null,
        access_code: accessCode,
      })
      .select()
      .single();

    if (reportResult.error) throw reportResult.error;

    // Dosyaları toplu olarak ekle
    if (data.files && data.files.length > 0) {
      const fileInserts = data.files.map(file => ({
        report_id: reportResult.data.id,
        file_name: file.fileName,
        file_url: file.fileUrl,
        file_uploader_name: file.fileUploaderName,
        file_uploader_email: file.fileUploaderEmail,
      }));

      const { error: filesError } = await supabase
        .from("report_files")
        .insert(fileInserts);

      if (filesError) throw filesError;
    }

    // Admin'e bildirim e-postası gönder
    const emailResult = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        report: {
          id: reportResult.data.id,
          description: data.description,
          location: data.location,
          created_at: data.date,
          name: data.name,
          email: data.email,
          phone: data.phone,
          report_files: data.files
        },
        accessCode: accessCode
      }),
    });

    // E-posta gönderimi başarısız olsa bile rapor oluşturma işlemi devam eder
    if (!emailResult.ok) {
      console.error('E-posta gönderimi başarısız oldu');
    }

    return { accessCode, error: null };
  } catch (error) {
    console.error("Rapor oluşturma hatası:", error);
    return { accessCode: null, error };
  }
}

// Get a report by access code
export async function getReportByAccessCode(accessCode: string) {
  const { data, error } = await supabase
    .from("reports")
    .select(`
      *,
      report_files (
        id,
        file_name,
        file_url,
        file_uploader_name,
        file_uploader_email,
        file_upload_date
      )
    `)
    .eq("access_code", accessCode)
    .single();

  if (error) {
    throw error;
  }

  return { data, error: null };
}

