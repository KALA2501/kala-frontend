// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyDKBo2srK32dDj4UvxqqKIOjv7uBWhXizY",
  authDomain: "tesis-5b568.firebaseapp.com",
  projectId: "tesis-5b568",
  storageBucket: "tesis-5b568.appspot.com", 
  messagingSenderId: "1091443176286",
  appId: "1:1091443176286:web:992600749baa78852a15cf",
  measurementId: "G-5QFZ0TJR1T"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app); 
