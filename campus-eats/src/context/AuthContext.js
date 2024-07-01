import React, {useContext, useEffect, useState} from "react";
import { doc, setDoc, getDocs, query, where, collection } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";


const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false);
        })

        return unsubscribe;
    }, []);

    async function checkUsernameExists(username) {
      try {
          const usernamesQuery = query(collection(db, "users"), where("username", "==", username));
          const querySnapshot = await getDocs(usernamesQuery);
          return !querySnapshot.empty;
      } catch (error) {
          console.error("Error checking username:", error);
          throw error;
      }
    }

    async function signup(email, password, username, firstname, lastname) {
      try {
          // checkUsernameExists(username);
          const usernameExists = await checkUsernameExists(username);
          if (usernameExists) {
              throw new Error('The username is already in use by another account.');
          }
  
          // createUserWithEmailAndPassword returns a UserCredential object
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
  
          const userRef = doc(db, "users", user.uid);
          await setDoc(userRef, {
              firstname,
              lastname,
              account_type: "regular",
              course_yr: null,
              phone_number: null,
              username,
              school_id: null,
              date_created: new Date(),
              email,
          });
  
          await updateProfile(user, {
              displayName: username
          });

          return user;
      } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
              throw new Error('The email address is already in use by another account.');
          } else {
              throw error;
          }
      }
  }

  async function login(identifier, password) {
    try {
        let email = identifier;
        if (!identifier.includes('@')) {
            const usernamesQuery = query(collection(db, "users"), where("username", "==", identifier));
            const querySnapshot = await getDocs(usernamesQuery);
            console.log("querySnapshot", querySnapshot.empty);

            if (querySnapshot.empty) {
                throw new Error('No account found with the provided username.');
            }

            const userDoc = querySnapshot.docs[0];
            console.log("userDoc", userDoc);
            console.log("userDoc.data()", userDoc.data());
            email = userDoc.data().email;
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            throw new Error('Please verify your email before logging in.');
        }

        return user;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `http://localhost:3000/login`
      });
      console.log('sent');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('Email not found.');
      }
      throw error;
    }
  }
  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  }
  function changeEmail(email) {
    return updateEmail(currentUser, email);
  }

  function changePassword(password) {
    return updatePassword(currentUser, password);
  }

  function changeProfileDisplayName(displayName) {
    return updateProfile(currentUser, {
      displayName
    }); 
  }

  function changeProfilePhotoURL(photoURL) {
    return updateProfile(currentUser, {
      photoURL
    });
  }



    // function signInWithMicrosoft(microsoftProvider) {
    //     return new Promise((resolve, reject) => {
    //         signInWithPopup(auth, microsoftProvider)
    //             .then(() => {
    //                 resolve(); // Resolve without any value if sign-in is successful
    //             })
    //             .catch(error => {
    //                 const errorCode = error.code;
    //                 let errorMessage = 'An error occurred while signing in with Microsoft.';
    
    //                 switch (errorCode) {
    //                     case 'auth/account-exists-with-different-credential':
    //                         errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
    //                         break;
    //                     // Add more cases to handle other error codes if needed
    
    //                     default:
    //                         break;
    //                 }
    
    //                 reject(errorMessage); // Reject the Promise with the error message
    //             });
    //     });
    // }

    


    const value = {
        currentUser,
        signup,
        login,
        resetPassword,
        logout,
        changeEmail,
        changePassword,
        changeProfileDisplayName,
        changeProfilePhotoURL,
    }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}