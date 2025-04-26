import { createI18n } from "next-international";

// Define the type for our translations
interface NestedObject {
  title: string;
  description: string;
}

interface LandingHero {
  title: string;
  subtitle: string;
  cta: string;
  cta2: string;
}

interface LandingFeatures {
  title: string;
  subtitle: string;
  feature1: NestedObject;
  feature2: NestedObject;
  feature3: NestedObject;
}

interface LandingBenefits {
  title: string;
  subtitle: string;
  forPatients: string;
  forDoctors: string;
  patient1: string;
  patient2: string;
  patient3: string;
  patient4: string;
  doctor1: string;
  doctor2: string;
  doctor3: string;
  doctor4: string;
}

interface LandingFAQ {
  title: string;
  subtitle: string;
  q1: string;
  a1: string;
  q2: string;
  a2: string;
  q3: string;
  a3: string;
  q4: string;
  a4: string;
}

interface LandingCTA {
  title: string;
  subtitle: string;
  button: string;
  button2: string;
}

interface LandingFooter {
  description: string;
  quickLinks: string;
  resources: string;
  contact: string;
  rights: string;
}

interface LandingTranslations {
  hero: LandingHero;
  features: LandingFeatures;
  benefits: LandingBenefits;
  faq: LandingFAQ;
  cta: LandingCTA;
  footer: LandingFooter;
}

// Define doctor specialties
type DoctorSpecialties = {
  allergist: string;
  cardiologist: string;
  dermatologist: string;
  endocrinologist: string;
  gastroenterologist: string;
  generalPractitioner: string;
  gynecologist: string;
  hematologist: string;
  nephrologist: string;
  neurologist: string;
  oncologist: string;
  orthopedicSurgeon: string;
  pediatrician: string;
  psychiatrist: string;
  psychologist: string;
  pulmonologist: string;
  radiologist: string;
  rheumatologist: string;
  urologist: string;
};

export interface Translations {
  [key: string]: string | { [key: string]: string | { [key: string]: string | { [key: string]: string | { [key: string]: string } } } };
  common: {
    appName: string;
    welcome: string;
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    confirm: string;
    search: string;
    filter: string;
    patients: string;
    actions: string;
    back: string;
    next: string;
    submit: string;
    today: string;
    select: string;
    selectAll: string;
    deselectAll: string;
    clear: string;
  };
  doctors: {
    doctors: string;
    allSpecialties: string;
    specialties: {
      all: string;
    } & DoctorSpecialties;
    search: {
      placeholder: string;
      noDoctorsFound: string;
      loading: string;
    };
    status: {
      loading: string;
      noDoctorsFound: string;
    };
    error: string;
    actions: {
      tryAgain: string;
      viewProfile: string;
      scheduleAppointment: string;
    };
    ratings: {
      noRating: string;
      reviews: string;
    };
    availableHours: string;
    noBio: string;
    noAddress: string;
    filterBySpecialty: string;
    viewProfile: string;
    scheduleAppointment: string;
  };
  work_days: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  auth: {
    login: string;
    logout: string;
    register: string;
    forgotPassword: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    createAccount: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    enterEmail: string;
    enterPassword: string;
    rememberMe: string;
    passwordReset: string;
    passwordResetSent: string;
    invalidCredentials: string;
    registerSuccess: string;
    emailAlreadyExists: string;
    passwordMismatch: string;
    passwordRequirements: string;
  };
  dashboard: {
    dashboard: string;
    welcome: string;
    upcomingAppointments: string;
    recentActivity: string;
    statistics: string;
    totalAppointments: string;
    completedAppointments: string;
    cancelledAppointments: string;
    pendingAppointments: string;
    noAppointments: string;
    scheduleAppointment: string;
  };
  appointments: {
    appointments: string;
    newAppointment: string;
    calendar: string;
    upcoming: string;
    past: string;
    cancelled: string;
    scheduleAppointment: string;
    rescheduleAppointment: string;
    cancelAppointment: string;
    confirmAppointment: string;
    doctor: string;
    patient: string;
    date: string;
    time: string;
    duration: string;
    status: string;
    reason: string;
    notes: string;
    statusPending: string;
    statusConfirmed: string;
    statusCompleted: string;
    statusCancelled: string;
    statusNoShow: string;
    appointmentDetails: string;
    selectDoctor: string;
    selectPatient: string;
    selectDate: string;
    selectTime: string;
    enterReason: string;
    confirmCancellation: string;
    cancellationReason: string;
    appointmentCreated: string;
    appointmentUpdated: string;
    appointmentCancelled: string;
    rescheduleWarning: string;
    cancelWarning: string;
  };
  profile: {
    profile: string;
    settings: string;
    account: string;
    security: string;
    notifications: string;
    personalInfo: string;
    accountSettings: string;
    updateProfile: string;
    changePassword: string;
    privacy: string;
    preferences: string;
    language: string;
    darkMode: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    profileUpdated: string;
    passwordChange: string;
    passwordMismatch: string;
    invalidPassword: string;
    uploadPhoto: string;
    removePhoto: string;
    profilePicture: string;
  };
  medications: {
    medications: string;
    prescriptions: string;
    activeMedications: string;
    pastMedications: string;
    addMedication: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string;
    prescribedBy: string;
    purpose: string;
    sideEffects: string;
    instructions: string;
    refills: string;
    pharmacy: string;
    lastRefill: string;
    nextRefill: string;
    noMedications: string;
    medicationDetails: string;
    medicationAdded: string;
    medicationUpdated: string;
    medicationRemoved: string;
  };
  notifications: {
    notifications: string;
    markAllAsRead: string;
    clearAll: string;
    unread: string;
    read: string;
    all: string;
    noNotifications: string;
    appointmentReminder: string;
    appointmentConfirmation: string;
    appointmentCancellation: string;
    appointmentChange: string;
    newMessage: string;
    newAppointmentRequest: string;
    medicationReminder: string;
    systemNotification: string;
  };
  landing: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
      cta2: string;
    };
    features: {
      title: string;
      subtitle: string;
      feature1: {
        title: string;
        description: string;
      };
      feature2: {
        title: string;
        description: string;
      };
      feature3: {
        title: string;
        description: string;
      };
    };
    benefits: {
      title: string;
      subtitle: string;
      forPatients: string;
      forDoctors: string;
      patient1: string;
      patient2: string;
      patient3: string;
      patient4: string;
      doctor1: string;
      doctor2: string;
      doctor3: string;
      doctor4: string;
    };
    faq: {
      title: string;
      subtitle: string;
      q1: string;
      a1: string;
      q2: string;
      a2: string;
      q3: string;
      a3: string;
      q4: string;
      a4: string;
    };
    cta: {
      title: string;
      subtitle: string;
      button: string;
      button2: string;
    };
    footer: {
      description: string;
      quickLinks: string;
      resources: string;
      contact: string;
      rights: string;
    };
  };
  errors: {
    generic: string;
    connection: string;
    notFound: string;
    serverError: string;
    unauthorized: string;
    forbidden: string;
    validation: string;
    timeout: string;
    conflictError: string;
    dataFetchError: string;
    formError: string;
    requiredField: string;
    invalidEmail: string;
    invalidPhone: string;
    invalidDate: string;
    invalidTime: string;
    pastDateError: string;
    weekendDateError: string;
    timeSlotUnavailable: string;
    appointmentOverlap: string;
  };
  calendar: {
    today: string;
    month: string;
    week: string;
    day: string;
    agenda: string;
    allDay: string;
    noEvents: string;
    eventDetails: string;
    eventTitle: string;
    eventDescription: string;
  };
}

// Type for imported locales
export type ImportedLocales = {
  [key: string]: () => Promise<Translations>;
};

// Create the i18n instance with type safety
export const {
  useI18n,
  useScopedI18n,
  I18nProvider,
} = createI18n(
  {
    en: () => import('./locales/en').then(mod => mod.default),
    es: () => import('./locales/es').then(mod => mod.default),
  },
);

// Lista de locales soportados
export const supportedLocales = ["es", "en"] as const;
