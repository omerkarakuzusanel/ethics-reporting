import { supabase } from "./supabase"

const READONLY_EMAIL = process.env.NEXT_PUBLIC_READONLY_EMAIL;

// Get all reports
export const getAllReports = async () => {
  const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

// Get report by ID
export const getReportById = async (id: string) => {
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
      ),
      report_updates (
        id,
        updated_at,
        updated_by,
        previous_status,
        new_status,
        previous_notes,
        new_notes,
        update_type
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    throw error
  }

  return data
}

// Update report
export const updateReport = async (id: string, updates: any) => {
  // Add a small delay to simulate network latency (makes the loading state more visible)
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error("Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.")
  }

  console.log("user.email:", user.email);

  // E-posta kontrolü: READONLY_EMAIL ise güncelleme engellensin
  if (user.email === READONLY_EMAIL) {
    throw new Error("Bu kullanıcı güncelleme yapamaz. Sadece görüntüleme yetkiniz var.")
  }

  // Get the current report to compare changes
  const { data: currentReport, error: fetchError } = await supabase
    .from("reports")
    .select("status, admin_notes")
    .eq("id", id)
    .single()

  if (fetchError) {
    throw fetchError
  }

  // Determine update type
  let updateType = "general_update"
  if (updates.status && updates.status !== currentReport.status) {
    updateType = "status_change"
  }
  if (updates.admin_notes && updates.admin_notes !== currentReport.admin_notes) {
    updateType = "notes_update"
  }

  // Create update record
  const updateRecord = {
    report_id: id,
    previous_status: currentReport.status,
    new_status: updates.status || currentReport.status,
    previous_notes: currentReport.admin_notes,
    new_notes: updates.admin_notes || currentReport.admin_notes,
    update_type: updateType,
    updated_by: user?.id
  }

  // Insert update record
  const { error: insertError } = await supabase
    .from("report_updates")
    .insert(updateRecord)

  if (insertError) {
    console.error("Error inserting update record:", insertError)
    // Continue with the update even if recording the update fails
  }

  // Update the report
  const { data, error } = await supabase
    .from("reports")
    .update({
      ...updates,
      updated_by: user?.id
    })
    .eq("id", id)
    .select()

  if (error) {
    throw error
  }

  return data
}

// Get report statistics
export const getReportStats = async () => {
  // Get total counts
  const { data: reports, error } = await supabase.from("reports").select("*")

  if (error) {
    throw error
  }

  // Calculate stats
  const total = reports.length
  const pending = reports.filter((r) => r.status === "pending").length
  const inProgress = reports.filter((r) => r.status === "inProgress").length
  const completed = reports.filter((r) => r.status === "completed").length
  const rejected = reports.filter((r) => r.status === "rejected").length

  // Get recent reports (last 6 months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return date.toISOString().split("T")[0].slice(0, 7) // YYYY-MM formatında
  }).reverse()

  const recentReports = last6Months.map((month) => {
    const count = reports.filter((r) => r.created_at.startsWith(month)).length

    return {
      date: month,
      count: count,
    }
  })

  return {
    total,
    pending,
    inProgress,
    completed,
    rejected,
    recentReports,
  }
}

// Update admin settings
export const updateAdminSettings = async (settings: any) => {
  // Add a small delay to simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800))

  // This is a placeholder function
  // In a real application, you would save these settings to your database
  console.log("Updating admin settings:", settings)

  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 1000)
  })
}

