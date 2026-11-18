export default defineNuxtRouteMiddleware(async (to) => {
  const { token, verifyManager, logout, isUnauthorizedError } = useManagerAuth()
  const loginLocation = {
    path: '/login',
    query: { redirect: to.fullPath },
  }

  if (!token.value) return navigateTo(loginLocation)

  try {
    if (!await verifyManager()) {
      return navigateTo({ ...loginLocation, query: { ...loginLocation.query, reason: 'access-denied' } })
    }
  } catch (error) {
    if (isUnauthorizedError(error)) {
      logout()
      return navigateTo({ ...loginLocation, query: { ...loginLocation.query, reason: 'session-expired' } })
    }
    throw error
  }
})
