import {
    onSnapshot,
    setDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    getDocs
} from 'firebase/firestore'
import { firedb } from './firebase'

// Helper function to get current PH time
const getPhilippinesTime = () => {
  const options = {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }
  return new Date().toLocaleString('en-US', options).split(',')[0]
}

// Store API key and initialize usage counter
export const storeApiKey = async (apiKey) => {
    try {
        const apiKeyDoc = doc(firedb, 'apiKeys', apiKey)
        const docSnap = await getDoc(apiKeyDoc)
        
        if (!docSnap.exists()) {
            // Initialize new API key entry with PH time
            await setDoc(apiKeyDoc, {
                key: apiKey,
                dailyUsage: 0,
                lastResetDate: getPhilippinesTime()
            })
        }
        return true
    } catch (error) {
        console.error('Error storing API key:', error)
        return false
    }
}

// Get API key usage
export const getApiKeyUsage = async (apiKey) => {
    try {
        const apiKeyDoc = doc(firedb, 'apiKeys', apiKey)
        const docSnap = await getDoc(apiKeyDoc)
        
        if (docSnap.exists()) {
            const data = docSnap.data()
            const phTime = getPhilippinesTime()
            
            // Reset counter if it's a new day in PH time
            if (data.lastResetDate !== phTime) {
                await updateDoc(apiKeyDoc, {
                    dailyUsage: 0,
                    lastResetDate: phTime
                })
                return 0
            }
            
            return data.dailyUsage
        }
        return 0
    } catch (error) {
        console.error('Error getting API key usage:', error)
        return 0
    }
}

// Modified get user API keys function to be more strict
export const getUserApiKeys = async (userId, userEmail) => {
    try {
        const apiKeysRef = collection(firedb, 'apiKeys')
        // Query only by userId for primary ownership
        const q = query(
            apiKeysRef, 
            where('userId', '==', userId)
        )
        const querySnapshot = await getDocs(q)
        
        const keys = []
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            keys.push({ 
                id: doc.id, 
                ...data,
                lastUpdated: data.lastResetDate,
                isExpired: data.dailyUsage >= 450,
                isOwner: data.userEmail === userEmail
            })
        })
        
        return keys
    } catch (error) {
        console.error('Error getting user API keys:', error)
        return []
    }
}

// Delete API key
export const deleteApiKey = async (apiKey) => {
    try {
        await deleteDoc(doc(firedb, 'apiKeys', apiKey))
        return true
    } catch (error) {
        console.error('Error deleting API key:', error)
        return false
    }
}


// Increment API key usage
export const incrementApiKeyUsage = async (apiKey) => {
    try {
        const apiKeyDoc = doc(firedb, 'apiKeys', apiKey)
        const docSnap = await getDoc(apiKeyDoc)
        
        if (docSnap.exists()) {
            const data = docSnap.data()
            const phTime = getPhilippinesTime()
            
            // Reset counter if it's a new day in PH time
            if (data.lastResetDate !== phTime) {
                await updateDoc(apiKeyDoc, {
                    dailyUsage: 1,
                    lastResetDate: phTime
                })
                return 1
            } else {
                const newUsage = data.dailyUsage + 1
                await updateDoc(apiKeyDoc, {
                    dailyUsage: newUsage
                })
                return newUsage
            }
        }
        return false
    } catch (error) {
        console.error('Error incrementing API key usage:', error)
        return false
    }
}

// Listen for real-time API key usage updates
export const listenToApiKeyUsage = (apiKey, callback) => {
    try {
        const apiKeyDoc = doc(firedb, 'apiKeys', apiKey)
        return onSnapshot(apiKeyDoc, (doc) => {
            if (doc.exists()) {
                const data = doc.data()
                callback(data.dailyUsage)
            }
        })
    } catch (error) {
        console.error('Error setting up API key usage listener:', error)
        return () => {}
    }
}

// Add function to get API key details
export const getApiKeyDetails = async (apiKey) => {
    try {
        const apiKeyDoc = doc(firedb, 'apiKeys', apiKey)
        const docSnap = await getDoc(apiKeyDoc)
        
        if (docSnap.exists()) {
            const data = docSnap.data()
            return {
                ...data,
                lastUpdated: data.lastResetDate,
                isExpired: data.dailyUsage >= 450
            }
        }
        return null
    } catch (error) {
        console.error('Error getting API key details:', error)
        return null
    }
}