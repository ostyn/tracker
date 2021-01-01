import firebase from "firebase";
export class UserService {
  availableUsers = [];
  authenticated = false;
  isAdmin = false;
  http: any;
  user: firebase.User;
  usersName: string;
  constructor() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.user = user;
        user.getIdTokenResult().then((tr) => {
          this.isAdmin = tr.claims.admin;
        });
        this.authenticated = true;
        this.usersName = user.displayName;
        var getAllUsers = firebase.functions().httpsCallable("getAllUsers");
        return getAllUsers()
          .then((resp) => {
            this.availableUsers = resp.data.users;
          })
          .catch((err) => {
            return { error: err.message };
          });
      }
    });
  }
  logout() {
    this.user = undefined;
    this.authenticated = false;
    firebase.auth().signOut();
  }
  get isAuthorized() {
    return this.authenticated && this.isAdmin;
  }
  get isLoggedIn() {
    return this.authenticated;
  }
}
