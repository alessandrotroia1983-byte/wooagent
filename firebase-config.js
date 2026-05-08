/*
  ╔══════════════════════════════════════════════════════════════╗
  ║  CONFIGURA QUI IL TUO PROGETTO FIREBASE                      ║
  ║  1. Vai su https://console.firebase.google.com               ║
  ║  2. Crea un progetto (es. "lapiazza-colreditora")            ║
  ║  3. Aggiungi un'app Web                                      ║
  ║  4. Copia le credenziali qui sotto                           ║
  ║  5. Abilita Firestore Database in modalità "test"            ║
  ║  6. Abilita Authentication → Email/Password per l'admin      ║
  ╚══════════════════════════════════════════════════════════════╝
*/
const FIREBASE_CONFIG = {
  apiKey:            "INSERISCI_API_KEY",
  authDomain:        "PROGETTO.firebaseapp.com",
  projectId:         "PROGETTO_ID",
  storageBucket:     "PROGETTO.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:abc123"
};

/*
  REGOLE FIRESTORE CONSIGLIATE (da incollare nella console Firebase):

  rules_version = '2';
  service cloud.firestore {
    match /databases/{db}/documents {
      // Lettura pubblica per menu, impostazioni, comunicazioni
      match /config/{doc}     { allow read: if true; allow write: if request.auth != null; }
      match /menu_categories/{doc} { allow read: if true; allow write: if request.auth != null; }
      match /menu_items/{doc} { allow read: if true; allow write: if request.auth != null; }
      match /broadcasts/{doc} { allow read: if true; allow write: if request.auth != null; }

      // Creazione pubblica, gestione solo admin
      match /orders/{doc}     { allow create: if true; allow read, update, delete: if request.auth != null; }
      match /bookings/{doc}   { allow create: if true; allow read, update, delete: if request.auth != null; }
      match /customers/{doc}  { allow create: if true; allow read, update, delete: if request.auth != null; }
    }
  }
*/
