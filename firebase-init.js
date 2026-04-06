// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA9BBRXlH0aWNa0CakMFtqnnrutQnAdHbk",
    authDomain: "dmho-life.firebaseapp.com",
    projectId: "dmho-life",
    storageBucket: "dmho-life.appspot.com",
    messagingSenderId: "1042952705830",
    appId: "1:1042952705830:web:2a357cd5c7c13b23ef53e7"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const commentsCollection = collection(db, "comments");

export { app, db, commentsCollection };