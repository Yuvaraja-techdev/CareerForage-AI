
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "careerforage-ai.firebaseapp.com",
  projectId: "careerforage-ai",
  storageBucket: "careerforage-ai.firebasestorage.app",
  messagingSenderId: "78155808190",
  appId: "1:78155808190:web:822751f09b172f9b930def"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export {auth , provider}