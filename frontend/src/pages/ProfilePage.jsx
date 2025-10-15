import React from 'react'
import { UserProfile } from '@clerk/clerk-react'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold font-display text-gray-900 mb-4">
            Account Settings
          </h1>
          <p className="text-lg text-gray-600">
            Manage your profile and account preferences
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <UserProfile 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0",
                headerTitle: "text-2xl font-bold",
                headerSubtitle: "text-gray-600",
              }
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}