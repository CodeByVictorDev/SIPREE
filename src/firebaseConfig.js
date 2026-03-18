// Archivo para configurar Firebase en un solo lugar y usarlo en toda la app
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyAqTAcwFRUIrM98F0st6Jgc4bv0Ifsl5G0",
    authDomain: "simon-a08e7.firebaseapp.com",
    projectId: "simon-a08e7",
    storageBucket: "simon-a08e7.firebasestorage.app",
    messagingSenderId: "268766570742",
    appId: "1:268766570742:web:361d8413bb37b308e2e4d7",
    measurementId: "G-1BYVZJNX3T"
};

// Inicializamos la aplicación de Firebase
export const app = initializeApp(firebaseConfig);
