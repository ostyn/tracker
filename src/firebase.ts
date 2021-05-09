import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage";
import "firebase/auth";

// Pass in your own configuration options
const config = {
  projectId: "PROJECT_ID_HERE",
  apiKey: "API_KEY_HERE",
  storageBucket: "STORAGE_BUCKET_HERE",
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
