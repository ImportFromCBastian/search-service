import { auth0 } from '@/lib/auth0'
import Link from 'next/link'
import ButtonAuth from '@/components/auth/login-button'

export default async function Home() {
  const session = await auth0.getSession()
  // Check if user is authenticated

  if (!session) {
    return (
      <>
        <Link
          href="/auth/login?screen_hint=signup"
          className="flex items-center justify-center"
        >
          <ButtonAuth />
        </Link>
      </>
    )
  }

  return (
    <>
      <p>Logged in as {session.user.email}</p>

      {/* Display user info (name, email, etc.) */}
      <h1>User Profile</h1>
      <pre>{JSON.stringify(session.user, null, 2)}</pre>

      {/* Ends the session and redirects to Auth0 to log out */}
      <a href="/auth/logout">Logout</a>
    </>
  )
}
