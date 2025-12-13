"use client";
import { useLanguage } from '../context/LanguageContext';

type Props = {
  size?: string; // e.g. 'w-8 h-8'
  textSize?: string; // e.g. 'text-base' or 'text-xl'
  wrapperClass?: string;
};

export default function LogoTiles({ size = 'w-8 h-8', textSize = 'text-base', wrapperClass = '' }: Props) {
  const { lang } = useLanguage();
  const letters = lang === 'uk' ? ['Р', 'О', 'М', 'А'] : ['R', 'O', 'M', 'A'];

  return (
    <div className={`flex items-center gap-1 ${wrapperClass}`}>
      {letters.map((ltr, i) => (
        <div
          key={i}
          className={`${size} bg-green-500 flex items-center justify-center font-bold ${textSize} text-black`}
        >
          {ltr}
        </div>
      ))}
    </div>
  );
}
