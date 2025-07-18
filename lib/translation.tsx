"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type Language = "tr" | "en";

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.tr;
}

const translations = {
  tr: {
    companyName: "SANEL",
    submitReport: {
      title: "Bildirimde Bulunun",
      description:
        "Maruz kaldığınız ya da gözlemlediğiniz, etik ihlal olarak değerlendirilebileceğini düşündüğünüz durumu bildirmek için aşağıdaki butona tıklayınız.",
      button: "Yeni Bildirim",
    },
    trackReport: {
      title: "Bildiriminizin durumu hakkında bilgi alın",
      description:
        "Daha önce bildirimde bulunduğunuz konunun durumu hakkında bilgi almak için lütfen sizinle daha önce paylaşılan Erişim Kodu ile giriş yapınız.",
      accessCodePlaceholder: "Erişim Kodu",
      button: "Bildirim Takibi",
    },
    newReport: {
      title: "Genel Bilgilendirme",
      description:
        "Bu sayfa, aşağıda yer verilen etik değerlerin ihlaline dair konuların bildirilmesi amacıyla kullanılmaktadır. Lütfen bildirimde bulunmak istediğiniz konunun bu kapsama girdiğini teyit ediniz.",
      ethicalViolations: [
        "Hırsızlık & rüşvet",
        "Çıkar çatışması",
        "Finansal kayıtların tahrif edilmesi",
        "Fiziksel/sözlü taciz",
        "Mobbing(psikolojik bezdirme)",
        "Ayrımcılık",
        "Şirket varlıklarının usulsüz biçimde kullanılması/şirket varlıklarına zarar verilmesi",
        "Şirket itibarına gölge düşürülmesi",
      ],
      acceptTerms: "Yukarıdaki bilgileri okudum ve kabul ediyorum.",
      continueButton: "Devam Et",
      backButton: "Geri Dön",
    },
    reportForm: {
      title: "Bildirim",
      incidentDetails: {
        title: "Olayın İçeriği",
        description:
          "Bildirimde bulunmak istediğiniz konuyu tüm detayları ile belirtiniz.",
        location: "Olayın gerçekleştiği yeri belirtiniz.",
        date: "Olayın gerçekleştiği zamanı belirtiniz.",
        datePlaceholder: "gg.aa.yyyy",
      },
      identity: {
        title: "Kendinizi Tanıtın",
        shareInfo:
          "İsim ve iletişim bilgilerimin Şirket yönetimi ile paylaşılmasını istiyorum.",
        anonymous: "İsim ve iletişim bilgilerimi paylaşmak istemiyorum.",
      },
      connection: {
        title: "Şirket ile bağlantınızı belirtiniz",
        employee: "Şirket çalışanıyım.",
        formerEmployee: "Eski bir şirket çalışanıyım.",
        other: "Diğer(Örn: Müşteri, Tedarikçi, Danışman vb.)",
      },
      submitButton: "Gönder",
      backButton: "Geri Dön",
    },
    success: {
      title: "Bildiriminiz Başarıyla Alındı",
      description:
        "Bildiriminiz için teşekkür ederiz. Bildiriminizin durumunu aşağıdaki erişim kodu ile takip edebilirsiniz.",
      accessCodeLabel: "Erişim Kodunuz:",
      note: "Lütfen bu kodu güvenli bir yerde saklayınız. Bildiriminizin durumunu kontrol etmek için bu koda ihtiyacınız olacaktır.",
      homeButton: "Ana Sayfaya Dön",
    },
    trackingPage: {
      title: "Bildirim Durumu",
      loading: "Bildirim bilgileri yükleniyor...",
      notFound: "Bildirim bulunamadı. Lütfen erişim kodunuzu kontrol ediniz.",
      status: "Durum:",
      date: "Bildirim Tarihi:",
      details: "Detaylar:",
      adminNotes: "Yönetici Notu:",
      homeButton: "Ana Sayfaya Dön",
    },
    statusLabels: {
      pending: "Onay Bekliyor",
      inProgress: "Değerlendiriliyor",
      completed: "Tamamlandı",
      rejected: "İhlal Tespit Edilmedi",
    },
  },
  en: {
    companyName: "SANEL",
    submitReport: {
      title: "Submit a Report",
      description:
        "Click the button below to report a situation that you have experienced or observed that could be considered an ethical violation.",
      button: "New Report",
    },
    trackReport: {
      title: "Check the status of your report",
      description:
        "To get information about the status of a report you have previously submitted, please log in with the Access Code that was shared with you.",
      accessCodePlaceholder: "Access Code",
      button: "Track Report",
    },
    newReport: {
      title: "General Information",
      description:
        "This page is used to report issues related to violations of the ethical values listed below. Please confirm that the issue you want to report falls within this scope.",
      ethicalViolations: [
        "Theft & bribery",
        "Conflict of interest",
        "Falsification of financial records",
        "Physical/verbal harassment",
        "Mobbing (psychological harassment)",
        "Discrimination",
        "Improper use of company assets/damage to company assets",
        "Damaging company reputation",
      ],
      acceptTerms: "I have read and accept the above information.",
      continueButton: "Continue",
      backButton: "Go Back",
    },
    reportForm: {
      title: "Report",
      incidentDetails: {
        title: "Incident Details",
        description:
          "Please describe the issue you want to report with all details.",
        location: "Please specify where the incident took place.",
        date: "Please specify when the incident took place.",
        datePlaceholder: "dd.mm.yyyy",
      },
      identity: {
        title: "Identify Yourself",
        shareInfo:
          "I want my name and contact information to be shared with Company management.",
        anonymous: "I do not want to share my name and contact information.",
      },
      connection: {
        title: "Specify your connection with the Company",
        employee: "I am a Company employee.",
        formerEmployee: "I am a former Company employee.",
        other: "Other (e.g., Customer, Supplier, Consultant, etc.)",
      },
      submitButton: "Submit",
      backButton: "Go Back",
    },
    success: {
      title: "Your Report Has Been Successfully Received",
      description:
        "Thank you for your report. You can track the status of your report with the access code below.",
      accessCodeLabel: "Your Access Code:",
      note: "Please keep this code in a safe place. You will need this code to check the status of your report.",
      homeButton: "Return to Home Page",
    },
    trackingPage: {
      title: "Report Status",
      loading: "Loading report information...",
      notFound: "Report not found. Please check your access code.",
      status: "Status:",
      date: "Report Date:",
      details: "Details:",
      adminNotes: "Admin Notes:",
      homeButton: "Return to Home Page",
    },
    statusLabels: {
      pending: "Under Review",
      inProgress: "In Evaluation",
      completed: "Completed",
      rejected: "Rejected",
    },
  },
};

const TranslationContext = createContext<TranslationContextType>({
  language: "tr",
  setLanguage: () => {},
  t: translations.tr,
});

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("tr");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "tr" || savedLanguage === "en")) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <TranslationContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t: translations[language],
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => useContext(TranslationContext);
