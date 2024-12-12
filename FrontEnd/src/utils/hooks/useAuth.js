// src/utils/hooks/useAuth.ts

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkUserRole } from '../auth-helpers'

export function useAuth(requiredRole = 'user') {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function validateAuth() {
      const userData = await checkUserRole()
      
      if (!userData) {
        router.push('/auth/login')
        return
      }

      const isAdmin = userData.is_admin || userData.role === 'admin'
      const hasAccess = requiredRole === 'admin' ? isAdmin : true

      setIsAuthorized(hasAccess)
      setIsLoading(false)

      if (!hasAccess) {
        router.push('/')
      }
    }

    validateAuth()
  }, [requiredRole, router])

  return { isAuthorized, isLoading }
}