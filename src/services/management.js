import {
    onSnapshot,
    setDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    getDocs,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore'
import { firedb } from './firebase'

// Modified store API key function to use toast for error handling
export const storeApiKey = async (apiKey, userId, userEmail) => {
    try {
        const apiKeyDoc = doc(firedb, 'apiKeys', apiKey)
        const docSnap = await getDoc(apiKeyDoc)
        
        if (docSnap.exists()) {
            const existingData = docSnap.data()
            if (existingData.userId !== userId) {
                return {
                    success: false,
                    error: 'This API key is already registered to another user'
                }
            }
            return { success: true }
        }

        // If key doesn't exist, create new entry with only one lastReset field
        await setDoc(apiKeyDoc, {
            key: apiKey,
            userId: userId,
            userEmail: userEmail,
            dailyUsage: 0,
            lastReset: serverTimestamp(), // Use only this field
            createdAt: serverTimestamp(),
            owner: userEmail
        })
        
        return { success: true }
    } catch (error) {
        console.error('Error storing API key:', error)
        return {
            success: false,
            error: 'Failed to store API key. Please try again.'
        }
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
                lastUpdated: data.lastReset,
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
                    lastReset: today
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
                    lastReset: today
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
                lastUpdated: data.lastReset,
                isExpired: data.dailyUsage >= 450
            }
        }
        return null
    } catch (error) {
        console.error('Error getting API key details:', error)
        return null
    }
}

export const resetApiKeyUsage = async (apiKey) => {
    try {
        const apiKeyRef = doc(firedb, 'apiKeys', apiKey)
        await updateDoc(apiKeyRef, {
            dailyUsage: 0,
            lastReset: serverTimestamp()
        })
    } catch (error) {
        console.error('Error resetting API key usage:', error)
        throw error
    }
}