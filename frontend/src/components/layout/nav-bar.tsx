import { Search } from 'lucide-react'
import Link from 'next/link'
import { Blobatar } from '@/components/ui/blobatar'
import { Separator } from '@/components/ui/separator'
import { navBarStrings } from '@/constraits/strings'

// Layout principal del componente NavBar
export default function NavBar() {
  return (
    <nav className="flex items-center justify-between text-sm text-foreground/80 backdrop-blur border-b border-black mx-4 py-2">
      <LogoSection />
      <NavBarLinkSection />
      <UserProfileSection />
    </nav>
  )
}

function LogoSection() {
  return (
    <h1>
      <Link className=" items-center gap-2 text-2xl font-bold flex" href="/">
        Search Service
        <Search />
      </Link>
    </h1>
  )
}

function NavBarLinkSection() {
  return (
    <>
      {navBarStrings.map((elements, index) => (
        <div key={elements.href} className="flex items-center gap-2 w-fit">
          <Link href={elements.href}> {elements.title}</Link>
          {index !== navBarStrings.length - 1 ? (
            <Separator orientation="vertical" className="size-20 bg-black" />
          ) : null}
        </div>
      ))}
    </>
  )
}

function UserProfileSection() {
  return (
    <span className="flex items-center gap-2">
      sebshndz (Admin) <Blobatar name="sebshndz2001" />
    </span>
  )
}
