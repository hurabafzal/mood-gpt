// This file exports authentication utilities from firebase.ts
import { getFirebaseAuth } from "./firebase"

export { getFirebaseAuth }

// Add any additional auth-related utilities here
export async function getCurrentUser() {
  const auth = await getFirebaseAuth()
  return auth?.currentUser || null
}

export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}
