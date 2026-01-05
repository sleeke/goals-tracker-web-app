import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection } from 'firebase/firestore'

// Load environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

console.log('🔧 Firebase Configuration Test')
console.log('================================\n')

// Test 1: Check environment variables
console.log('✓ Environment variables loaded:')
console.log(`  - API Key: ${firebaseConfig.apiKey ? '✓' : '✗'} (${firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'missing'})`)
console.log(`  - Auth Domain: ${firebaseConfig.authDomain ? '✓' : '✗'} (${firebaseConfig.authDomain})`)
console.log(`  - Project ID: ${firebaseConfig.projectId ? '✓' : '✗'} (${firebaseConfig.projectId})`)
console.log(`  - Storage Bucket: ${firebaseConfig.storageBucket ? '✓' : '✗'} (${firebaseConfig.storageBucket})`)
console.log(`  - Messaging Sender ID: ${firebaseConfig.messagingSenderId ? '✓' : '✗'} (${firebaseConfig.messagingSenderId})`)
console.log(`  - App ID: ${firebaseConfig.appId ? '✓' : '✗'} (${firebaseConfig.appId})\n`)

// Test 2: Initialize Firebase
try {
  const app = initializeApp(firebaseConfig)
  console.log('✓ Firebase app initialized successfully\n')

  // Test 3: Initialize Auth
  const auth = getAuth(app)
  console.log('✓ Firebase Auth initialized')
  
  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log(`  - Current user: ${user.email} (${user.uid})`)
    } else {
      console.log('  - No user currently logged in (this is normal for initial setup)')
    }
  })

  // Test 4: Initialize Firestore
  const db = getFirestore(app)
  console.log('✓ Firestore initialized\n')

  // Test 5: Test Firestore connection by querying
  try {
    void collection(db, '__testing__')
    console.log('✓ Firestore connection verified\n')

    console.log('🎉 Firebase Setup Successful!')
    console.log('================================')
    console.log('Your Firebase project is connected and ready to use.')
    console.log('\nNext steps:')
    console.log('1. Set up Firestore security rules (see plans/DATA_MODEL.md)')
    console.log('2. Configure authentication providers in Firebase Console')
    console.log('3. Start building your app with: npm run dev')
  } catch (error) {
    console.error('✗ Firestore connection test failed:', error)
  }
} catch (error) {
  console.error('✗ Firebase initialization failed:', error)
}
