// src/lib/firebase/db.ts
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    addDoc, 
    serverTimestamp,
    Timestamp
  } from 'firebase/firestore';
  import { db } from './config';
  import { 
    User, 
    Doctor, 
    Patient, 
    Appointment, 
    Medication, 
    AppointmentStatus 
  } from '../types';
  
  // User functions
  export const createUserProfile = async (uid: string, userData: Partial<User>) => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };
  
  export const updateUserProfile = async (uid: string, userData: Partial<User>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  };
  
  export const getUserProfile = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    
    return null;
  };
  
  // Doctor functions
  export const createDoctorProfile = async (uid: string, doctorData: Partial<Doctor>) => {
    const doctorRef = doc(db, 'doctors', uid);
    await setDoc(doctorRef, {
      ...doctorData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };
  
  export const updateDoctorProfile = async (uid: string, doctorData: Partial<Doctor>) => {
    const doctorRef = doc(db, 'doctors', uid);
    await updateDoc(doctorRef, {
      ...doctorData,
      updatedAt: serverTimestamp()
    });
  };
  
  export const getDoctorProfile = async (uid: string) => {
    const doctorRef = doc(db, 'doctors', uid);
    const doctorDoc = await getDoc(doctorRef);
    
    if (doctorDoc.exists()) {
      return doctorDoc.data() as Doctor;
    }
    
    return null;
  };
  
  export const getAllDoctors = async () => {
    const doctorsRef = collection(db, 'doctors');
    const snapshot = await getDocs(doctorsRef);
    
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as Doctor[];
  };
  
  export const getDoctorsBySpecialty = async (specialty: string) => {
    const doctorsRef = collection(db, 'doctors');
    const q = query(doctorsRef, where('specialty', '==', specialty));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as Doctor[];
  };
  
  // Patient functions
  export const createPatientProfile = async (uid: string, patientData: Partial<Patient>) => {
    const patientRef = doc(db, 'patients', uid);
    await setDoc(patientRef, {
      ...patientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };
  
  export const updatePatientProfile = async (uid: string, patientData: Partial<Patient>) => {
    const patientRef = doc(db, 'patients', uid);
    await updateDoc(patientRef, {
      ...patientData,
      updatedAt: serverTimestamp()
    });
  };
  
  export const getPatientProfile = async (uid: string) => {
    const patientRef = doc(db, 'patients', uid);
    const patientDoc = await getDoc(patientRef);
    
    if (patientDoc.exists()) {
      return patientDoc.data() as Patient;
    }
    
    return null;
  };
  
  export const getAllPatients = async () => {
    const patientsRef = collection(db, 'patients');
    const snapshot = await getDocs(patientsRef);
    
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as Patient[];
  };
  
  export const getDoctorPatients = async (doctorId: string) => {
    // Get unique patients who have had appointments with this doctor
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('doctorId', '==', doctorId));
    const snapshot = await getDocs(q);
    
    const patientIds = new Set(snapshot.docs.map(doc => doc.data().patientId));
    
    const patients: Patient[] = [];
    for (const patientId of patientIds) {
      const patient = await getPatientProfile(patientId);
      if (patient) patients.push(patient);
    }
    
    return patients;
  };
  
  // Appointment functions
  export const createAppointment = async (appointmentData: Partial<Appointment>) => {
    const appointmentsRef = collection(db, 'appointments');
    
    // Convert date to Firestore Timestamp if needed
    const dataToSave = {
      ...appointmentData,
      date: appointmentData.date instanceof Date ? 
        Timestamp.fromDate(appointmentData.date) : appointmentData.date,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(appointmentsRef, dataToSave);
    return docRef.id;
  };
  
  export const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    const appointmentRef = doc(db, 'appointments', id);
    
    // Convert date to Firestore Timestamp if needed
    const dataToUpdate = {
      ...appointmentData,
      date: appointmentData.date instanceof Date ? 
        Timestamp.fromDate(appointmentData.date) : appointmentData.date,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(appointmentRef, dataToUpdate);
  };
  
  export const cancelAppointment = async (id: string) => {
    const appointmentRef = doc(db, 'appointments', id);
    await updateDoc(appointmentRef, {
      status: 'CANCELLED' as AppointmentStatus,
      updatedAt: serverTimestamp()
    });
  };
  
  export const getAppointment = async (id: string) => {
    const appointmentRef = doc(db, 'appointments', id);
    const appointmentDoc = await getDoc(appointmentRef);
    
    if (appointmentDoc.exists()) {
      return appointmentDoc.data() as Appointment;
    }
    
    return null;
  };
  
  export const getDoctorAppointments = async (doctorId: string, startDate?: Date, endDate?: Date) => {
    const appointmentsRef = collection(db, 'appointments');
    let q = query(appointmentsRef, where('doctorId', '==', doctorId));
    
    if (startDate && endDate) {
      q = query(
        q, 
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate))
      );
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate() // Convert Timestamp back to Date
    })) as Appointment[];
  };
  
  export const getPatientAppointments = async (patientId: string) => {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('patientId', '==', patientId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate() // Convert Timestamp back to Date
    })) as Appointment[];
  };
  
  // Medication functions
  export const addMedication = async (medicationData: Partial<Medication>) => {
    const medicationsRef = collection(db, 'medications');
    
    const dataToSave = {
      ...medicationData,
      startDate: medicationData.startDate instanceof Date ? 
        Timestamp.fromDate(medicationData.startDate) : medicationData.startDate,
      endDate: medicationData.endDate instanceof Date ? 
        Timestamp.fromDate(medicationData.endDate) : medicationData.endDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(medicationsRef, dataToSave);
    return docRef.id;
  };
  
  export const deleteMedication = async (id: string) => {
    const medicationRef = doc(db, 'medications', id);
    await deleteDoc(medicationRef);
  };
  
  export const getAppointmentMedications = async (appointmentId: string) => {
    const medicationsRef = collection(db, 'medications');
    const q = query(medicationsRef, where('appointmentId', '==', appointmentId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate?.toDate()
    })) as Medication[];
  };
  
  export const getPatientMedications = async (patientId: string) => {
    const medicationsRef = collection(db, 'medications');
    const q = query(medicationsRef, where('patientId', '==', patientId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate?.toDate()
    })) as Medication[];
  };