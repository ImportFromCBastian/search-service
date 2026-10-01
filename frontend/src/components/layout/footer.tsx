export default function Footer() {
  return (
    <footer className="w-full bg-background/50 text-sm text-foreground/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:gap-0">
        <p className="text-center text-sm leading-loose">
          &copy; {new Date().getFullYear()} Search Service. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
