'use client';

import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';

export default function Header() {
  return (
    <>
      <MobileHeader />   {/* Shows only on mobile: md:hidden */}
      <DesktopHeader />  {/* Shows only on desktop: hidden md:block */}
    </>
  );
}