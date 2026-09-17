import Link from "next/link";
import { sports } from "@/lib/content";
import { sportSlug } from "@/lib/supabase-public";

export function Header() {
  return (
    <header className="siteHeader">
      <div className="topBar shell">
        <Link className="brand" href="/" aria-label="Sports Rewritten home">
          <span className="brandSports">SPORTS</span><span className="brandRewritten">REWRITTEN</span>
          <span className="timelineMark" aria-hidden="true">⇢</span>
        </Link>
        <p className="tagline">THE HOME OF THE SPORTS MULTIVERSE</p>
        <div className="headerActions">
          <Link className="searchButton" href="/search" aria-label="Search">⌕ <span>Search</span></Link>
          <Link href="/studio" className="signIn">Contributor Studio</Link>
          <Link href="/admin" className="signIn">Editorial Dashboard</Link>
          <Link href="/membership" className="goldButton">Subscribe</Link>
        </div>
      </div>
      <nav className="mainNav" aria-label="Primary navigation">
        <div className="shell navScroll">
          <Link href="/">Home</Link>
          {sports.map((sport) => <Link key={sport} href={`/${sportSlug(sport)}`}>{sport}</Link>)}
          <Link href="/vault">The Vault</Link>
        </div>
      </nav>
    </header>
  );
}
