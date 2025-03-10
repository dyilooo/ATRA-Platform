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

// Store API key and initialize usage counter
export const storeApiKey = async (apiKey) => {
    try {
        const apiKeyDoc = doc(firedb, 'apiKeys', apiKey)
        const docSnap = await getDoc(apiKeyDoc)
        
        if (!docSnap.exists()) {
            // Initialize new API key entry
            await setDoc(apiKeyDoc, {
                key: apiKey,
                dailyUsage: 0,
                lastResetDate: new Date().toISOString().split('T')[0] // Store date as YYYY-MM-DD
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
            const today = new Date().toISOString().split('T')[0]
            
            // Reset counter if it's a new day
            if (data.lastResetDate !== today) {
                await updateDoc(apiKeyDoc, {
                    dailyUsage: 0,
                    lastResetDate: today
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

// Increment API key usage
export const incrementApiKeyUsage = async (apiKey) => {
    try {
        const apiKeyDoc = doc(firedb, 'apiKeys', apiKey)
        const docSnap = await getDoc(apiKeyDoc)
        
        if (docSnap.exists()) {
            const data = docSnap.data()
            const today = new Date().toISOString().split('T')[0]
            
            // Reset counter if it's a new day
            if (data.lastResetDate !== today) {
                await updateDoc(apiKeyDoc, {
                    dailyUsage: 1,
                    lastResetDate: today
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