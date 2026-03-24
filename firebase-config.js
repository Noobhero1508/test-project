// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyARTFI1ORDfEtYh2RCZYWRwqoNCE-Ys1N0",
  authDomain: "my-fpt-project.firebaseapp.com",
  databaseURL: "https://my-fpt-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-fpt-project",
  storageBucket: "my-fpt-project.firebasestorage.app",
  messagingSenderId: "406070842482",
  appId: "1:406070842482:web:5a12685963a2c697519eeb",
  measurementId: "G-B604QD7KWK"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
