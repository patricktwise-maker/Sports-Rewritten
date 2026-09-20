import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footerGrid">
        <div><strong>SPORTS <span>REWRITTEN</span></strong><p>The Home of the Sports Multiverse</p></div>
        <div className="footerLinks">
          <Link href="/vault">Articles</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/membership">Subscribe</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
        <p className="footerLine">REAL HISTORY. PLAUSIBLE DIVERGENCE. REWRITTEN CONSEQUENCES.</p>
      </div>
    </footer>
  );
}
