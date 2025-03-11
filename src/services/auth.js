import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut
  } from 'firebase/auth'
  import { doc, setDoc } from 'firebase/firestore'
  import { auth, firedb } from './firebase'
  
  export const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Create user document in Firestore
      await setDoc(doc(firedb, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString()
      })
      
      return { success: true, user }
    } catch (error) {
      // Handle specific Firebase error codes
      let errorMessage = 'An error occurred during sign up'
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address'
          break
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.'
          break
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password.'
          break
      }
      return { success: false, error: errorMessage }
    }
  }
  
  export const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      
      // Handle specific Firebase auth error codes
      let errorMessage = 'An error occurred during sign in'
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'user-not-found'
          break
        case 'auth/wrong-password':
          errorMessage = 'invalid-password'
          break
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials.'
          break
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address'
          break
        case 'auth/user-disabled':
          errorMessage = 'account-disabled'
          break
        case 'auth/too-many-requests':
          errorMessage = 'too-many-requests'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection'
          break
        case 'auth/invalid-login-credentials':
          errorMessage = 'Invalid login credentials. Please check your email and password'
          break
        case 'auth/internal-error':
          errorMessage = 'An internal error occurred. Please try again later'
          break
        default:
          errorMessage = 'Failed to sign in. Please try again'
      }
      return { success: false, error: errorMessage }
    }
  }
  
  export const logOut = async () => {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }