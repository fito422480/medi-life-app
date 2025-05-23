import { Translations } from "../config";

const translations: Translations =  {
  // Common texts
  common: {
    appName: "MediAgenda",
    welcome: "Welcome to MediAgenda",
    loading: "Loading.... ",
    error: "An error has occurred",
    success: "Successful operation",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    search: "Search",
    filter: "Filter",
    actions: "Actions",
    back: "Return",
    next: "Next",
    submit: "Submit",
    today: "Today",
    select: "Select",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    clear: "Clear",
    patients: "Patients",
  },

  // Authentication
  auth: {
    login: "Log In",
    logout: "Log Out",
    register: "Register",
    forgotPassword: "Forgot your password?",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    createAccount: "Create an account",
    email: "Email",
    username: "Username",
    password: "Password",
    confirmPassword: "Confirm Password",
    enterEmail: "Enter your email",
    enterPassword: "Enter your password",
    rememberMe: "Remember me",
    passwordReset: "Reset Password",
    passwordResetSent: "A password reset link has been sent",
    invalidCredentials: "Invalid credentials",
    registerSuccess: "Registration successful, you can now log in",
    emailAlreadyExists: "This email is already registered",
    passwordMismatch: "Passwords do not match",
    passwordRequirements:
      "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character",
  },

  // Dashboard
  dashboard: {
    dashboard: "Dashboard",
    welcome: "Welcome, {name}",
    upcomingAppointments: "Upcoming Appointments",
    recentActivity: "Recent Activity",
    statistics: "Statistics",
    totalAppointments: "Total Appointments",
    completedAppointments: "Completed Appointments",
    cancelledAppointments: "Cancelled Appointments",
    pendingAppointments: "Pending Appointments",
    noAppointments: "No appointments scheduled",
    scheduleAppointment: "Schedule Appointment",
  },

  // Appointments
  appointments: {
    appointments: "Appointments",
    newAppointment: "New Appointment",
    calendar: "Calendar",
    upcoming: "Upcoming",
    past: "Past",
    cancelled: "Cancelled",
    scheduleAppointment: "Schedule Appointment",
    rescheduleAppointment: "Reschedule Appointment",
    cancelAppointment: "Cancel Appointment",
    confirmAppointment: "Confirm Appointment",
    doctor: "Doctor",
    patient: "Patient",
    date: "Date",
    time: "Time",
    duration: "Duration",
    status: "Status",
    reason: "Reason",
    notes: "Notes",
    statusPending: "Pending",
    statusConfirmed: "Confirmed",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
    statusNoShow: "No Show",
    appointmentDetails: "Appointment Details",
    selectDoctor: "Select Doctor",
    selectPatient: "Select Patient",
    selectDate: "Select Date",
    selectTime: "Select Time",
    enterReason: "Enter reason for appointment",
    confirmCancellation: "Are you sure you want to cancel this appointment?",
    cancellationReason: "Cancellation reason",
    appointmentCreated: "Appointment scheduled successfully",
    appointmentUpdated: "Appointment updated successfully",
    appointmentCancelled: "Appointment cancelled successfully",
    rescheduleWarning:
      "Please make sure you are available at the new date and time",
    cancelWarning: "Cancellations within 24 hours may be subject to a fee",
  },

  // Doctors
  doctors: {
    doctors: "Doctors",
    allSpecialties: "All Specialties",
    specialties: {
      all: "All Specialties",
      allergist: "Allergist",
      cardiologist: "Cardiologist",
      dermatologist: "Dermatologist",
      endocrinologist: "Endocrinologist",
      gastroenterologist: "Gastroenterologist",
      generalPractitioner: "General Practice",
      gynecologist: "Gynecologist",
      hematologist: "Hematologist",
      nephrologist: "Nephrologist",
      neurologist: "Neurologist",
      oncologist: "Oncologist",
      orthopedicSurgeon: "Orthopedic Surgeon",
      pediatrician: "Pediatrician",
      psychiatrist: "Psychiatrist",
      psychologist: "Psychologist",
      pulmonologist: "Pulmonologist",
      radiologist: "Radiologist",
      rheumatologist: "Rheumatologist",
      urologist: "Urologist"
    },
    search: {
      placeholder: "Search doctors...",
      noDoctorsFound: "No doctors found",
      loading: "Loading doctors..."
    },
    status: {
      loading: "Loading doctors...",
      noDoctorsFound: "No doctors found matching your criteria"
    },
    error: "Error loading doctors",
    actions: {
      tryAgain: "Try Again",
      viewProfile: "View Profile",
      scheduleAppointment: "Schedule Appointment"
    },
    ratings: {
      noRating: "No rating yet",
      reviews: "reviews"
    },
    availableHours: "Available hours",
    noBio: "No biography available",
    noAddress: "No address available",
    filterBySpecialty: "Filter by specialty",
    viewProfile: "View profile of",
    scheduleAppointment: "Schedule appointment with"
  },

  // Patients
  // patients: {
  //   patients: "Patients",
  //   patientList: "Patient List",
  //   patientDetails: "Patient Details",
  //   medicalHistory: "Medical History",
  //   allergies: "Allergies",
  //   medications: "Medications",
  //   conditions: "Medical Conditions",
  //   demographic: "Demographic Information",
  //   emergencyContact: "Emergency Contact",
  //   addPatient: "Add Patient",
  //   editPatient: "Edit Patient",
  //   noPatients: "No patients registered",
  //   patientInfo: "Patient Information",
  //   dateOfBirth: "Date of Birth",
  //   age: "Age",
  //   gender: "Gender",
  //   bloodType: "Blood Type",
  //   height: "Height",
  //   weight: "Weight",
  //   lastVisit: "Last Visit",
  //   upcomingVisit: "Upcoming Visit",
  // },

  // Profile
  profile: {
    profile: "Profile",
    settings: "Settings",
    account: "Account",
    security: "Security",
    notifications: "Notifications",
    personalInfo: "Personal Information",
    accountSettings: "Account Settings",
    updateProfile: "Update Profile",
    changePassword: "Change Password",
    privacy: "Privacy",
    preferences: "Preferences",
    language: "Language",
    darkMode: "Dark Mode",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    profileUpdated: "Profile updated successfully",
    passwordChange: "Password changed successfully",
    passwordMismatch: "Passwords do not match",
    invalidPassword: "Current password is incorrect",
    uploadPhoto: "Upload Photo",
    removePhoto: "Remove Photo",
    profilePicture: "Profile Picture",
  },

  // Medications
  medications: {
    medications: "Medications",
    prescriptions: "Prescriptions",
    activeMedications: "Active Medications",
    pastMedications: "Past Medications",
    addMedication: "Add Medication",
    medicationName: "Medication Name",
    dosage: "Dosage",
    frequency: "Frequency",
    startDate: "Start Date",
    endDate: "End Date",
    prescribedBy: "Prescribed By",
    purpose: "Purpose",
    sideEffects: "Side Effects",
    instructions: "Instructions",
    refills: "Refills",
    pharmacy: "Pharmacy",
    lastRefill: "Last Refill",
    nextRefill: "Next Refill",
    noMedications: "No medications registered",
    medicationDetails: "Medication Details",
    medicationAdded: "Medication added successfully",
    medicationUpdated: "Medication updated successfully",
    medicationRemoved: "Medication removed successfully",
  },

  // Notifications
  notifications: {
    notifications: "Notifications",
    markAllAsRead: "Mark all as read",
    clearAll: "Clear all",
    unread: "Unread",
    read: "Read",
    all: "All",
    noNotifications: "No notifications",
    appointmentReminder: "Appointment Reminder",
    appointmentConfirmation: "Appointment Confirmation",
    appointmentCancellation: "Appointment Cancellation",
    appointmentChange: "Appointment Change",
    newMessage: "New Message",
    newAppointmentRequest: "New Appointment Request",
    medicationReminder: "Medication Reminder",
    systemNotification: "System Notification",
  },

  // Landing Page
  landing: {
    hero: {
      title: "Scheduling your medical appointments has never been easier",
      subtitle:
        "MediAgenda is the platform that connects patients and doctors for efficient medical appointment management. Schedule, manage, and receive reminders, all in one place.",
      cta: "Create an account",
      cta2: "I already have an account",
    },
    features: {
      title: "Main Features",
      subtitle:
        "Designed for both patients and doctors, MediAgenda offers all the necessary tools for efficient medical appointment management.",
      feature1: {
        title: "Smart Scheduling",
        description:
          "Schedule and manage your medical appointments with an intuitive calendar that shows real-time availability.",
      },
      feature2: {
        title: "Automatic Reminders",
        description:
          "Receive notifications and reminders for your upcoming appointments to never miss an important visit.",
      },
      feature3: {
        title: "Medical History",
        description:
          "Access your complete medical history and securely share relevant information with your doctors.",
      },
    },
    benefits: {
      title: "Benefits",
      subtitle:
        "MediAgenda improves the experience for both patients and healthcare professionals.",
      forPatients: "For Patients",
      forDoctors: "For Professionals",
      patient1:
        "Find the right specialist and schedule appointments easily, without phone calls.",
      patient2:
        "Receive automatic reminders to never forget your scheduled appointments.",
      patient3:
        "Access your medical history, results, and prescriptions in one place.",
      patient4: "Avoid unnecessary waiting times with precise scheduling.",
      doctor1:
        "Manage your schedule efficiently and reduce last-minute cancellations.",
      doctor2:
        "Access your patients' complete medical history to provide better service.",
      doctor3:
        "Automate reminders and communication with patients to improve attendance.",
      doctor4:
        "Increase your visibility and reach new patients through the platform.",
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Answers to common questions about our platform.",
      q1: "How does MediAgenda work?",
      a1: "MediAgenda connects patients with doctors through a digital platform. Patients can search for specialists, check their availability, and schedule appointments. Doctors can manage their schedule and access relevant medical information from their patients.",
      q2: "Does it cost anything to use the platform?",
      a2: "For patients, using the platform is completely free. Healthcare professionals have a free trial period, after which they can choose from different subscription plans according to their needs.",
      q3: "Is my medical information secure?",
      a3: "Absolutely. Data privacy and security are our priority. We use end-to-end encryption and comply with all applicable medical data protection regulations.",
      q4: "Can I cancel or reschedule my appointments?",
      a4: "Yes, you can cancel or reschedule your appointments directly from the platform, while respecting each doctor's cancellation policy (generally 24-48 hours before the scheduled appointment).",
    },
    cta: {
      title: "Start using MediAgenda today",
      subtitle:
        "Join thousands of patients and professionals who have already improved their healthcare experience.",
      button: "Create free account",
      button2: "Log in",
    },
    footer: {
      description:
        "The leading platform for medical appointment management that connects patients with healthcare professionals.",
      quickLinks: "Quick Links",
      resources: "Resources",
      contact: "Contact",
      rights: "All rights reserved.",
    },
  },

  // Error messages
  errors: {
    generic: "An error has occurred",
    connection: "Connection error",
    notFound: "Not found",
    serverError: "Server error",
    unauthorized: "Unauthorized",
    forbidden: "Access denied",
    validation: "Validation error",
    timeout: "Request timeout",
    conflictError: "Data conflict",
    dataFetchError: "Error fetching data",
    formError: "Please correct the errors in the form",
    requiredField: "This field is required",
    invalidEmail: "Invalid email",
    invalidPhone: "Invalid phone number",
    invalidDate: "Invalid date",
    invalidTime: "Invalid time",
    pastDateError: "Past dates cannot be selected",
    weekendDateError: "Weekend dates cannot be selected",
    timeSlotUnavailable: "This time slot is unavailable",
    appointmentOverlap:
      "You already have an appointment scheduled at this time",
  },
  calendar: {
    today: "Today",
    month: "Month",
    week: "Week",
    day: "Day",
    agenda: "Agenda",
    allDay: "All day",
    noEvents: "No events scheduled",
    eventDetails: "Event details",
    eventTitle: "Event Title",
    eventDescription: "Event Description",
  },
  work_days: {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  },
};

export default translations;
