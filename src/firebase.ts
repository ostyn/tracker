import firebase from "firebase/app";
import secrets from "../secrets.js";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage";
import "firebase/auth";

// Pass in your own configuration options
const config = {
  projectId: "regretless-life-tracker",
  apiKey: secrets.firebaseApiKey,
  storageBucket: "regretless-life-tracker.appspot.com",
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: true,
    },
  ],
  authDomain: "http://localhost:8080",
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
  firebase
    .firestore()
    .enablePersistence()
    .catch((err) => {
      console.error(err);
    });
}

export default firebase;
