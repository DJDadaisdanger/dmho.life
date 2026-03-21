// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA9BBRXlH0aWNa0CakMFtqnnrutQnAdHbk",
    authDomain: "dmho-life.firebaseapp.com",
    projectId: "dmho-life",
    storageBucket: "dmho-life.appspot.com",
    messagingSenderId: "1042952705830",
    appId: "1:1042952705830:web:2a357cd5c7c13b23ef53e7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const commentsCollection = db.collection("comments");