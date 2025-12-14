"use client";
import { useLanguage } from '../context/LanguageContext';

type Props = {
  size?: string; // e.g. 'w-8 h-8'
  textSize?: string; // e.g. 'text-base' or 'text-xl'
  wrapperClass?: string;
  letters?: string[]; // optional override letters
};

export default function LogoTiles({
  size = 'w-8 h-8',
  textSize = 'text-base',
  wrapperClass = '',
  letters,
}: Props) {
  const { lang } = useLanguage();

  const defaultLetters = letters
    ? letters
    : lang === 'uk'
    ? ['Р', 'О', 'М', 'А']
    : ['R', 'O', 'M', 'A'];

  return (
    <div className={`flex items-center gap-1 ${wrapperClass}`}>
      {defaultLetters.map((ltr, i) => (
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
