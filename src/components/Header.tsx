import Link from "next/link";
import { sports } from "@/lib/content";

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
          <button className="searchButton" type="button" aria-label="Search">⌕ <span>Search</span></button>
          <Link href="/studio" className="signIn">Contributor Studio</Link>
          <Link href="#membership" className="goldButton">Subscribe</Link>
        </div>
      </div>
      <nav className="mainNav" aria-label="Primary navigation">
        <div className="shell navScroll">
          <Link href="/" className="active">Home</Link>
          {sports.map((sport) => <Link key={sport} href="#categories">{sport}</Link>)}
          <Link href="#vault">The Vault</Link>
        </div>
      </nav>
    </header>
  );
}
