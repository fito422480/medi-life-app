// src/lib/firebase/enhanced-service.ts
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
  Timestamp,
  enableIndexedDbPersistence,
  onSnapshot,
  QuerySnapshot,
  DocumentSnapshot,
  enableMultiTabIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  PersistenceSettings,
  WriteBatch,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import { NetworkStatus } from "@/lib/hooks/use-network-status";

// Define nuestras interfaces de operación para la cola
type OperationType = "add" | "update" | "delete";

interface PendingOperation {
  id: string;
  operationType: OperationType;
  collection: string;
  docId?: string;
  data?: any;
  timestamp: number;
}

// Activar la persistencia multi-tab con tamaño de caché ilimitado
const initializeOfflineSupport = async () => {
  try {
    await enableMultiTabIndexedDbPersistence(db);
    console.log("Firestore persistence enabled successfully");
    return true;
  } catch (error) {
    if ((error as any)?.code === "failed-precondition") {
      // Multiple tabs open, fallback to single-tab persistence
      console.warn(
        "Firestore persistence failed (multiple tabs open). Data will be cached for offline use only in this tab."
      );
      try {
        await enableIndexedDbPersistence(db);
        return true;
      } catch (err) {
        console.error("Failed to enable even single-tab persistence:", err);
        return false;
      }
    } else if ((error as any)?.code === "unimplemented") {
      // Browser does not support IndexedDB
      console.error(
        "Offline persistence not supported in this browser. The app will not work offline."
      );
      return false;
    } else {
      console.error("Unknown error enabling persistence:", error);
      return false;
    }
  }
};

// Clase para gestionar operaciones pendientes cuando estamos offline
class OfflineOperationQueue {
  private static instance: OfflineOperationQueue;
  private pendingOperations: PendingOperation[] = [];
  private localStorageKey = "firestore_pending_operations";
  private processing = false;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): OfflineOperationQueue {
    if (!OfflineOperationQueue.instance) {
      OfflineOperationQueue.instance = new OfflineOperationQueue();
    }
    return OfflineOperationQueue.instance;
  }

  private loadFromStorage(): void {
    try {
      const storedOps = localStorage.getItem(this.localStorageKey);
      if (storedOps) {
        this.pendingOperations = JSON.parse(storedOps);
      }
    } catch (error) {
      console.error("Error loading pending operations from storage:", error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(
        this.localStorageKey,
        JSON.stringify(this.pendingOperations)
      );
    } catch (error) {
      console.error("Error saving pending operations to storage:", error);
    }
  }

  public addOperation(
    operation: Omit<PendingOperation, "id" | "timestamp">
  ): void {
    const newOperation: PendingOperation = {
      ...operation,
      id: Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
    };
    this.pendingOperations.push(newOperation);
    this.saveToStorage();
  }

  public hasPendingOperations(): boolean {
    return this.pendingOperations.length > 0;
  }

  public getPendingOperationsCount(): number {
    return this.pendingOperations.length;
  }

  public async processQueue(networkStatus: NetworkStatus): Promise<boolean> {
    if (
      this.processing ||
      networkStatus !== NetworkStatus.ONLINE ||
      !this.hasPendingOperations()
    ) {
      return false;
    }

    try {
      this.processing = true;
      console.log(
        `Processing ${this.pendingOperations.length} pending operations...`
      );

      // Ordenar operaciones por timestamp
      const sortedOps = [...this.pendingOperations].sort(
        (a, b) => a.timestamp - b.timestamp
      );

      // Procesar en batches para operaciones más eficientes
      const batchSize = 500; // Firestore tiene un límite de 500 ops por batch
      for (let i = 0; i < sortedOps.length; i += batchSize) {
        const batch = writeBatch(db);
        const currentBatch = sortedOps.slice(i, i + batchSize);

        for (const op of currentBatch) {
          try {
            await this.executeOperation(op, batch);
            // Eliminar la operación procesada
            this.pendingOperations = this.pendingOperations.filter(
              (o) => o.id !== op.id
            );
          } catch (error) {
            console.error(`Error executing operation ${op.id}:`, error);
            // Dejamos la operación en la cola para reintento posterior
          }
        }

        try {
          await batch.commit();
        } catch (error) {
          console.error("Error committing batch:", error);
          break; // Salir del procesamiento si hay error en el batch
        }
      }

      this.saveToStorage();
      return true;
    } catch (error) {
      console.error("Error processing operation queue:", error);
      return false;
    } finally {
      this.processing = false;
    }
  }

  private async executeOperation(
    operation: PendingOperation,
    batch: WriteBatch
  ): Promise<void> {
    const {
      operationType,
      collection: collectionPath,
      docId,
      data,
    } = operation;

    switch (operationType) {
      case "add":
        if (docId) {
          // Añadir documento con ID específico
          const docRef = doc(db, collectionPath, docId);
          batch.set(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
          });
        } else {
          // Añadir nuevo documento con ID automático
          // No podemos usar batch para esto, tenemos que hacerlo directamente
          const collectionRef = collection(db, collectionPath);
          await addDoc(collectionRef, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        break;

      case "update":
        if (!docId)
          throw new Error("Document ID is required for update operations");
        const updateDocRef = doc(db, collectionPath, docId);
        batch.update(updateDocRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
        break;

      case "delete":
        if (!docId)
          throw new Error("Document ID is required for delete operations");
        const deleteDocRef = doc(db, collectionPath, docId);
        batch.delete(deleteDocRef);
        break;

      default:
        throw new Error(`Unsupported operation type: ${operationType}`);
    }
  }
}

// Métodos mejorados que verifican estado de conexión
const enhancedFirestoreService = {
  // Inicialización
  initialize: async (): Promise<boolean> => {
    return await initializeOfflineSupport();
  },

  // Operaciones con documentos
  createDocument: async <T>(
    collectionPath: string,
    docId: string | null,
    data: Partial<T>,
    networkStatus: NetworkStatus
  ): Promise<string> => {
    try {
      // Crear documento inmediatamente si estamos online
      if (networkStatus === NetworkStatus.ONLINE) {
        if (docId) {
          // Crear con ID específico
          const docRef = doc(db, collectionPath, docId);
          await setDoc(docRef, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          return docId;
        } else {
          // Crear con ID automático
          const collectionRef = collection(db, collectionPath);
          const newDoc = await addDoc(collectionRef, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          return newDoc.id;
        }
      } else {
        // Modo offline: encolar la operación
        OfflineOperationQueue.getInstance().addOperation({
          operationType: "add",
          collection: collectionPath,
          docId: docId ?? undefined,
          data,
        });

        // Generar un ID local para compatibilidad de UI
        const tempId = `temp_${Math.random().toString(36).substring(2, 15)}`;
        return docId || tempId;
      }
    } catch (error) {
      console.error("Error creating document:", error);

      // Si hay error de red, intentamos encolar la operación
      OfflineOperationQueue.getInstance().addOperation({
        operationType: "add",
        collection: collectionPath,
        docId: docId ?? undefined,
        data,
      });

      const tempId = `temp_${Math.random().toString(36).substring(2, 15)}`;
      return docId || tempId;
    }
  },

  updateDocument: async <T>(
    collectionPath: string,
    docId: string,
    data: Partial<T>,
    networkStatus: NetworkStatus
  ): Promise<boolean> => {
    try {
      if (networkStatus === NetworkStatus.ONLINE) {
        const docRef = doc(db, collectionPath, docId);
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
        return true;
      } else {
        // Modo offline: encolar la operación
        OfflineOperationQueue.getInstance().addOperation({
          operationType: "update",
          collection: collectionPath,
          docId,
          data,
        });
        return true;
      }
    } catch (error) {
      console.error("Error updating document:", error);

      // Si hay error de red, intentamos encolar la operación
      OfflineOperationQueue.getInstance().addOperation({
        operationType: "update",
        collection: collectionPath,
        docId,
        data,
      });

      return false;
    }
  },

  deleteDocument: async (
    collectionPath: string,
    docId: string,
    networkStatus: NetworkStatus
  ): Promise<boolean> => {
    try {
      if (networkStatus === NetworkStatus.ONLINE) {
        const docRef = doc(db, collectionPath, docId);
        await deleteDoc(docRef);
        return true;
      } else {
        // Modo offline: encolar la operación
        OfflineOperationQueue.getInstance().addOperation({
          operationType: "delete",
          collection: collectionPath,
          docId,
        });
        return true;
      }
    } catch (error) {
      console.error("Error deleting document:", error);

      // Si hay error de red, intentamos encolar la operación
      OfflineOperationQueue.getInstance().addOperation({
        operationType: "delete",
        collection: collectionPath,
        docId,
      });

      return false;
    }
  },

  // Lectura de datos (usa caché automáticamente en offline)
  getDocument: async <T>(
    collectionPath: string,
    docId: string
  ): Promise<T | null> => {
    try {
      const docRef = doc(db, collectionPath, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error("Error getting document:", error);
      return null;
    }
  },

  // Método para escuchar cambios en tiempo real (incluye caché offline)
  listenToDocument: <T>(
    collectionPath: string,
    docId: string,
    callback: (data: T | null) => void
  ) => {
    const docRef = doc(db, collectionPath, docId);
    return onSnapshot(
      docRef,
      { includeMetadataChanges: true },
      (snapshot: DocumentSnapshot) => {
        const isFromCache = snapshot.metadata.fromCache;

        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as T;
          callback(data);

          if (isFromCache) {
            console.log("Document data from cache", docId);
          } else {
            console.log("Document data from server", docId);
          }
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Error listening to document:", error);
        callback(null);
      }
    );
  },

  // Consulta de colecciones con soporte offline
  getCollection: async <T>(
    collectionPath: string,
    queryConstraints = []
  ): Promise<T[]> => {
    try {
      const collectionRef = collection(db, collectionPath);
      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error("Error getting collection:", error);
      return [];
    }
  },

  // Escuchar cambios en una colección
  listenToCollection: <T>(
    collectionPath: string,
    callback: (data: T[]) => void,
    queryConstraints = []
  ) => {
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, ...queryConstraints);

    return onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot: QuerySnapshot) => {
        const isFromCache = snapshot.metadata.fromCache;

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        callback(data);

        if (isFromCache) {
          console.log(`Collection data from cache: ${collectionPath}`);
        } else {
          console.log(`Collection data from server: ${collectionPath}`);
        }
      },
      (error) => {
        console.error("Error listening to collection:", error);
        callback([]);
      }
    );
  },

  // Gestión de operaciones pendientes
  getPendingOperationsCount: (): number => {
    return OfflineOperationQueue.getInstance().getPendingOperationsCount();
  },

  hasPendingOperations: (): boolean => {
    return OfflineOperationQueue.getInstance().hasPendingOperations();
  },

  processPendingOperations: async (
    networkStatus: NetworkStatus
  ): Promise<boolean> => {
    return await OfflineOperationQueue.getInstance().processQueue(
      networkStatus
    );
  },
};

export default enhancedFirestoreService;
