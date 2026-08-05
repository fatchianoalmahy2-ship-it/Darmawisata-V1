import React from 'react';

interface SchoolLogoProps {
  className?: string;
  src?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = 'w-10 h-10',
  src = '/smkpgri2ponorogo.png',
}) => {
  return (
    <img
      src={src || '/smkpgri2ponorogo.png'}
      alt="Logo SMK PGRI 2 Ponorogo"
      className={`${className} object-contain select-none transition-transform hover:scale-105 duration-200`}
      id="school-crest-logo"
    />
  );
};

