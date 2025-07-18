"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/navbar";
import { useTranslation } from "@/lib/translation";
import { createReport } from "@/lib/supabase";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  Send,
  User,
  UserRound,
  Building,
  Info,
  Upload,
  File,
  X,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { validateFile, formatFileSize } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ReportFormPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    date: "",
    identityOption: "anonymous",
    connectionOption: "employee",
    connectionOther: "",
    name: "",
    email: "",
    phone: "",
    files: [] as File[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILES = 3;
  const MAX_FILE_SIZE_MB = 5;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hata varsa temizle
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    
    // Dosya sayısı kontrolü
    if (selectedFiles.length + newFiles.length > MAX_FILES) {
      setError(language === "tr" 
        ? `En fazla ${MAX_FILES} dosya yükleyebilirsiniz.` 
        : `You can upload a maximum of ${MAX_FILES} files.`);
      return;
    }

    // Her dosya için boyut kontrolü
    for (const file of newFiles) {
      const validation = validateFile(file, MAX_FILE_SIZE_MB);
      if (!validation.isValid) {
        setError(validation.error || "");
        return;
      }
    }

    setSelectedFiles([...selectedFiles, ...newFiles]);
    setError("");
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (!e.dataTransfer.files) return;

    const newFiles = Array.from(e.dataTransfer.files);
    
    // Dosya sayısı kontrolü
    if (selectedFiles.length + newFiles.length > MAX_FILES) {
      setError(language === "tr" 
        ? `En fazla ${MAX_FILES} dosya yükleyebilirsiniz.` 
        : `You can upload a maximum of ${MAX_FILES} files.`);
      return;
    }

    // Her dosya için boyut kontrolü
    for (const file of newFiles) {
      const validation = validateFile(file, MAX_FILE_SIZE_MB);
      if (!validation.isValid) {
        setError(validation.error || "");
        return;
      }
    }

    setSelectedFiles([...selectedFiles, ...newFiles]);
    setError("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description =
        language === "tr"
          ? "Lütfen olay içeriğini giriniz"
          : "Please enter the incident description";
    }
    if (!formData.location.trim()) {
      newErrors.location =
        language === "tr"
          ? "Lütfen olayın gerçekleştiği yeri belirtiniz"
          : "Please specify where the incident took place";
    }
    if (!formData.date) {
      newErrors.date =
        language === "tr"
          ? "Lütfen olayın gerçekleştiği tarihi belirtiniz"
          : "Please specify when the incident took place";
    }
    if (formData.identityOption === "share") {
      if (!formData.name.trim()) {
        newErrors.name =
          language === "tr"
            ? "Lütfen isminizi giriniz"
            : "Please enter your name";
      }
      if (!formData.email.trim()) {
        newErrors.email =
          language === "tr"
            ? "Lütfen e-posta adresinizi giriniz"
            : "Please enter your email";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email =
          language === "tr"
            ? "Lütfen geçerli bir e-posta adresi giriniz"
            : "Please enter a valid email address";
      }
    }
    if (
      formData.connectionOption === "other" &&
      !formData.connectionOther.trim()
    ) {
      newErrors.connectionOther =
        language === "tr"
          ? "Lütfen şirket ile bağlantınızı belirtiniz"
          : "Please specify your connection with the company";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);
    setError(null);

    if (!validateForm()) {
      const firstErrorId = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setIsSubmitting(false);
      return;
    }

    try {
      const uploadedFiles = [];

      // Tüm dosyaları yükle
      for (const file of selectedFiles) {
        const fileName = `${Date.now()}-${file.name}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from("report-uploads")
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("report-uploads")
          .getPublicUrl(fileName);

        uploadedFiles.push({
          fileUrl: publicUrl || "",
          fileName: fileName,
          fileUploaderName: formData.identityOption === "share" ? formData.name : null,
          fileUploaderEmail: formData.identityOption === "share" ? formData.email : null,
        });
      }

      const { accessCode, error } = await createReport({
        ...formData,
        files: uploadedFiles,
      });

      if (error) {
        throw error;
      }

      // Başarılı sayfasına yönlendir
      router.push(`/new-report/success?code=${accessCode}`);
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      <main className="flex-1 container max-w-4xl mx-auto py-6 md:py-12 px-4">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <button
              onClick={() => router.push("/")}
              className="text-sm hover:text-foreground transition-colors"
            >
              {language === "tr" ? "Ana Sayfa" : "Home"}
            </button>
            <span>/</span>
            <button
              onClick={() => router.push("/new-report")}
              className="text-sm hover:text-foreground transition-colors"
            >
              {language === "tr" ? "Yeni Bildirim" : "New Report"}
            </button>
            <span>/</span>
            <span className="text-sm">
              {language === "tr" ? "Form" : "Form"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t.reportForm.title}
          </h1>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
          <Info className="h-4 w-4" />
          <AlertDescription>
            {language === "tr"
              ? "Lütfen bildiriminizi mümkün olduğunca detaylı bir şekilde doldurunuz. Bu, durumun doğru değerlendirilmesi için önemlidir."
              : "Please fill out your report in as much detail as possible. This is important for a proper assessment of the situation."}
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Hata</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showSuccess && accessCode && (
          <Alert className="mb-6">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Başarılı!</AlertTitle>
            <AlertDescription>
              Raporunuz başarıyla oluşturuldu. Raporunuzu takip etmek için erişim kodunuz:{" "}
              <span className="font-bold">{accessCode}</span>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Progress indicator */}
          <div className="mb-8 hidden md:block">
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 w-1/3"></div>
              </div>
              <div className="flex justify-between pt-6">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                    1
                  </div>
                  <span className="text-xs mt-2">
                    {language === "tr" ? "Bilgilendirme" : "Information"}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                    2
                  </div>
                  <span className="text-xs mt-2">
                    {language === "tr" ? "Form" : "Form"}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                    3
                  </div>
                  <span className="text-xs mt-2">
                    {language === "tr" ? "Tamamlandı" : "Completed"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Details Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 md:pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertCircle className="h-5 w-5 text-primary" />
                {t.reportForm.incidentDetails.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label
                  htmlFor="description"
                  className="text-base flex items-center gap-2"
                >
                  <span>{t.reportForm.incidentDetails.description}</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={`${
                    errors.description
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  } resize-none`}
                  placeholder={
                    language === "tr"
                      ? "Lütfen olayı detaylı bir şekilde anlatınız..."
                      : "Please describe the incident in detail..."
                  }
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="location"
                    className="text-base flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>{t.reportForm.incidentDetails.location}</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={
                      errors.location
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                    placeholder={
                      language === "tr"
                        ? "Örn: İstanbul Ofisi, 3. Kat"
                        : "E.g., Istanbul Office, 3rd Floor"
                    }
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="date"
                    className="text-base flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>{t.reportForm.incidentDetails.date}</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={
                      errors.date
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {t.reportForm.incidentDetails.datePlaceholder}
                  </p>
                </div>
              </div>
              {/* Dosya Yükleme Alanı */}
              <div className="space-y-2">
                <Label htmlFor="files">
                  {language === "tr" ? "Dosyalar" : "Files"}
                </Label>

                {error && (
                  <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary"
                  } ${selectedFiles.length >= MAX_FILES ? "opacity-50 cursor-not-allowed" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="files"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={selectedFiles.length >= MAX_FILES}
                  />
                  <label
                    htmlFor="files"
                    className={`cursor-pointer ${selectedFiles.length >= MAX_FILES ? "cursor-not-allowed" : ""}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className={`h-8 w-8 ${selectedFiles.length >= MAX_FILES ? "text-muted-foreground/50" : "text-muted-foreground"}`} />
                      <p className="text-sm text-muted-foreground">
                        {selectedFiles.length >= MAX_FILES 
                          ? (language === "tr" 
                              ? "Maksimum dosya sayısına ulaşıldı" 
                              : "Maximum number of files reached")
                          : (language === "tr" 
                              ? "Dosyaları sürükleyip bırakın veya seçmek için tıklayın" 
                              : "Drag and drop files or click to select")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === "tr"
                          ? `Her dosya en fazla ${MAX_FILE_SIZE_MB}MB, toplamda en fazla ${MAX_FILES} dosya. Kabul edilen dosya türleri: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, TXT`
                          : `Each file up to ${MAX_FILE_SIZE_MB}MB, maximum ${MAX_FILES} files total. Accepted file types: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, TXT`}
                      </p>
                    </div>
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/20"
                      >
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Identity Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 md:pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-primary" />
                {t.reportForm.identity.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <RadioGroup
                defaultValue="anonymous"
                value={formData.identityOption}
                onValueChange={(value) =>
                  handleRadioChange("identityOption", value)
                }
                className="space-y-4"
              >
                <Label
                  htmlFor="identity-anonymous"
                  className={`flex items-start space-x-3 p-4 rounded-md border ${
                    formData.identityOption === "anonymous"
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/30 hover:bg-muted/50"
                  } transition-colors cursor-pointer w-full`}
                >
                  <RadioGroupItem
                    value="anonymous"
                    id="identity-anonymous"
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <span className="font-medium">
                      {t.reportForm.identity.anonymous}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {language === "tr"
                        ? "Kimliğiniz gizli tutulacak ve bildiriminiz anonim olarak değerlendirilecektir."
                        : "Your identity will be kept confidential and your report will be evaluated anonymously."}
                    </p>
                  </div>
                </Label>
                <Label
                  htmlFor="identity-share"
                  className={`flex items-start space-x-3 p-4 rounded-md border ${
                    formData.identityOption === "share"
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/30 hover:bg-muted/50"
                  } transition-colors cursor-pointer w-full`}
                >
                  <RadioGroupItem
                    value="share"
                    id="identity-share"
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <span className="font-medium">
                      {t.reportForm.identity.shareInfo}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {language === "tr"
                        ? "Bildiriminiz hakkında sizinle iletişime geçebilmemiz için bilgilerinizi paylaşabilirsiniz."
                        : "You can share your information so we can contact you about your report."}
                    </p>
                  </div>
                </Label>
              </RadioGroup>
              {formData.identityOption === "share" && (
                <div className="space-y-4 p-4 rounded-md border bg-muted/20 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="name"
                        className="text-base flex items-center gap-2"
                      >
                        <UserRound className="h-4 w-4" />
                        <span>
                          {language === "tr" ? "İsim Soyisim" : "Full Name"}
                        </span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={
                          errors.name
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                        placeholder={
                          language === "tr"
                            ? "Adınız ve soyadınız"
                            : "Your full name"
                        }
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="phone"
                        className="text-base flex items-center gap-2"
                      >
                        <span>{language === "tr" ? "Telefon" : "Phone"}</span>
                        <span className="text-muted-foreground text-xs">
                          {language === "tr" ? "(İsteğe bağlı)" : "(Optional)"}
                        </span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={
                          language === "tr"
                            ? "5XX XXX XX XX"
                            : "+XX XXX XXX XXXX"
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="email"
                      className="text-base flex items-center gap-2"
                    >
                      <span>{language === "tr" ? "E-posta" : "Email"}</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={
                        errors.email
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                      placeholder={
                        language === "tr"
                          ? "ornek@email.com"
                          : "example@email.com"
                      }
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connection Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 md:pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building className="h-5 w-5 text-primary" />
                {t.reportForm.connection.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <RadioGroup
                defaultValue="employee"
                value={formData.connectionOption}
                onValueChange={(value) =>
                  handleRadioChange("connectionOption", value)
                }
                className="space-y-3"
              >
                <Label
                  htmlFor="connection-employee"
                  className={`flex items-center space-x-2 p-4 rounded-md border ${
                    formData.connectionOption === "employee"
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/30 hover:bg-muted/50"
                  } transition-colors cursor-pointer w-full`}
                >
                  <RadioGroupItem value="employee" id="connection-employee" />
                  <span>{t.reportForm.connection.employee}</span>
                </Label>
                <Label
                  htmlFor="connection-former"
                  className={`flex items-center space-x-2 p-4 rounded-md border ${
                    formData.connectionOption === "former"
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/30 hover:bg-muted/50"
                  } transition-colors cursor-pointer w-full`}
                >
                  <RadioGroupItem value="former" id="connection-former" />
                  <span>{t.reportForm.connection.formerEmployee}</span>
                </Label>
                <Label
                  htmlFor="connection-other"
                  className={`flex items-center space-x-2 p-4 rounded-md border ${
                    formData.connectionOption === "other"
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/30 hover:bg-muted/50"
                  } transition-colors cursor-pointer w-full`}
                >
                  <RadioGroupItem value="other" id="connection-other" />
                  <span>{t.reportForm.connection.other}</span>
                </Label>
              </RadioGroup>
              {formData.connectionOption === "other" && (
                <div className="space-y-3 p-4 rounded-md border bg-muted/20 ml-0">
                  <Label
                    htmlFor="connectionOther"
                    className="text-base flex items-center gap-2"
                  >
                    <span>
                      {language === "tr"
                        ? "Lütfen belirtiniz"
                        : "Please specify"}
                    </span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="connectionOther"
                    name="connectionOther"
                    value={formData.connectionOther}
                    onChange={handleChange}
                    placeholder={
                      language === "tr"
                        ? "Müşteri, Tedarikçi, Danışman vb."
                        : "Customer, Supplier, Consultant, etc."
                    }
                    className={
                      errors.connectionOther
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {errors.connectionOther && (
                    <p className="text-sm text-red-500">
                      {errors.connectionOther}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Required fields note */}
          <div className="text-sm text-muted-foreground">
            <span className="text-red-500">*</span>{" "}
            {language === "tr" ? "Zorunlu alanlar" : "Required fields"}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/new-report")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.reportForm.backButton}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
              size="lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {language === "tr" ? "Gönderiliyor..." : "Submitting..."}
                </span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t.reportForm.submitButton}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "tr" ? "Raporu Gönder" : "Submit Report"}</DialogTitle>
      <DialogDescription>
        {language === "tr"
          ? "Raporunuzu göndermek üzeresiniz. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?"
          : "You are about to submit your report. This action cannot be undone. Do you want to proceed?"}
      </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              {language === "tr" ? "İptal" : "Cancel"}
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Gönderiliyor..." : language === "tr" ? "Evet, Gönder" : "Yes, Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
