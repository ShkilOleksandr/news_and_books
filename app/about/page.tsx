'use client'
import { useState } from 'react';

const translations = {
  uk: {
    about: 'Про нас',
    mission: 'Наша місія',
    missionText: 'KYRS - це платформа, створена для того, щоб тримати вас у курсі найважливіших подій. Ми віримо в силу інформації та її здатність змінювати світ на краще.',
    values: 'Наші цінності',
    valuesTitle1: 'Незалежність',
    valuesText1: 'Ми надаємо об\'єктивну інформацію без політичного чи комерційного впливу.',
    valuesTitle2: 'Якість',
    valuesText2: 'Кожна стаття проходить ретельну перевірку фактів та редагування.',
    valuesTitle3: 'Доступність',
    valuesText3: 'Ми робимо інформацію доступною для всіх, незалежно від background.',
    team: 'Наша команда',
    teamText: 'Ми - група професійних журналістів, редакторів та розробників, які працюють разом, щоб створити найкращу платформу для новин.',
    joinUs: 'Приєднуйтесь до нас',
    joinText: 'Хочете стати частиною нашої команди? Ми завжди шукаємо талановитих людей.',
    contact: 'Зв\'яжіться з нами'
  },
  en: {
    about: 'About Us',
    mission: 'Our Mission',
    missionText: 'KYRS is a platform created to keep you informed about the most important events. We believe in the power of information and its ability to change the world for the better.',
    values: 'Our Values',
    valuesTitle1: 'Independence',
    valuesText1: 'We provide objective information without political or commercial influence.',
    valuesTitle2: 'Quality',
    valuesText2: 'Every article undergoes thorough fact-checking and editing.',
    valuesTitle3: 'Accessibility',
    valuesText3: 'We make information accessible to everyone, regardless of background.',
    team: 'Our Team',
    teamText: 'We are a group of professional journalists, editors, and developers working together to create the best news platform.',
    joinUs: 'Join Us',
    joinText: 'Want to become part of our team? We are always looking for talented people.',
    contact: 'Contact Us'
  }
};

export default function AboutPage() {
  const [lang, setLang] = useState('uk');
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Page Title */}
        <h1 className="text-7xl font-bold mb-20 text-center">{t.about}</h1>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-green-500">{t.mission}</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                {t.missionText}
              </p>
            </div>
            <div className="h-96 bg-gray-800 rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                alt="Team"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-12 text-center">{t.values}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-8 rounded-2xl hover:bg-gray-800 transition-colors">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.valuesTitle1}</h3>
              <p className="text-gray-400">{t.valuesText1}</p>
            </div>

            <div className="bg-gray-900 p-8 rounded-2xl hover:bg-gray-800 transition-colors">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.valuesTitle2}</h3>
              <p className="text-gray-400">{t.valuesText2}</p>
            </div>

            <div className="bg-gray-900 p-8 rounded-2xl hover:bg-gray-800 transition-colors">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">{t.valuesTitle3}</h3>
              <p className="text-gray-400">{t.valuesText3}</p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-green-500/10 to-transparent p-12 rounded-2xl">
            <h2 className="text-4xl font-bold mb-6">{t.team}</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl">
              {t.teamText}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="w-32 h-32 bg-gray-800 rounded-full mx-auto mb-4 overflow-hidden">
                    <img 
                      src={`https://images.unsplash.com/photo-${1438761580000 + i * 100000000}?w=200&h=200&fit=crop&crop=faces`}
                      alt="Team member"
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <h4 className="font-bold text-lg">
                    {lang === 'uk' ? `Член команди ${i}` : `Team Member ${i}`}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {lang === 'uk' ? 'Журналіст' : 'Journalist'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gray-900 p-12 rounded-2xl">
          <h2 className="text-4xl font-bold mb-6">{t.joinUs}</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t.joinText}
          </p>
          <a 
            href="/contact"
            className="inline-block bg-green-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-400 transition-all transform hover:scale-105"
          >
            {t.contact}
          </a>
        </section>
      </div>
    </div>
  );
}