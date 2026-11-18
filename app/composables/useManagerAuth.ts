export interface ManagerProfile {
  id: number
  username: string
  email: string
  role?: {
    name?: string | null
    type?: string | null
  } | null
}

export function useManagerAuth() {
  const config = useRuntimeConfig()
  const strapiUrl = String(config.public.strapiUrl).replace(/\/$/, '')
  const token = useCookie<string | null>('shopkart-manager-token', {
    maxAge: 60 * 60 * 8,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  const profile = useState<ManagerProfile | null>('shopkart-manager-profile', () => null)

  function logout() {
    token.value = null
    profile.value = null
  }

  async function verifyManager() {
    if (!token.value) return false

    const user = await $fetch<ManagerProfile>(`${strapiUrl}/api/users/me`, {
      query: { populate: 'role' },
      headers: { Authorization: `Bearer ${token.value}` },
    })
    const roleName = user.role?.name?.trim().toLowerCase()
    const roleType = user.role?.type?.trim().toLowerCase()
    if (roleName !== 'store manager' && roleType !== 'store-manager') {
      logout()
      return false
    }

    profile.value = user
    return true
  }

  async function login(identifier: string, password: string) {
    const response = await $fetch<{ jwt?: string }>(`${strapiUrl}/api/auth/local`, {
      method: 'POST',
      body: { identifier, password },
    })
    if (!response.jwt) throw new Error('The sign-in response did not include an access token.')

    token.value = response.jwt
    if (!await verifyManager()) {
      throw new Error('This account is not assigned the Store Manager role.')
    }
  }

  function isUnauthorizedError(error: unknown) {
    return typeof error === 'object'
      && error !== null
      && 'statusCode' in error
      && error.statusCode === 401
  }

  return { token, profile, login, logout, verifyManager, isUnauthorizedError }
}
