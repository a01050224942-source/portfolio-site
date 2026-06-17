import React, { useState, useEffect } from 'react';

export default function TypingTitle({ theme }) {
  const words = [
    "열정을 다하는 개발자",
    "혁신을 사랑하는 개발자",
    "디자인 감각있는 개발자"
  ];
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0); 
  const [currentText, setCurrentText] = useState("");         
  const [isDeleting, setIsDeleting] = useState(false);       

  useEffect(() => {
    const currentFullText = words[currentWordIndex];
    const typeSpeed = isDeleting ? 40 : 80; 

    const timeoutId = setTimeout(() => {
      if (!isDeleting) {
        setCurrentText(currentFullText.substring(0, currentText.length + 1));
        
        if (currentText.length + 1 === currentFullText.length) {
          setTimeout(() => setIsDeleting(true), 1800); 
        }
      } else {
        setCurrentText(currentFullText.substring(0, currentText.length - 1));
        
        if (currentText.length === 0) {
          isDeleting && setIsDeleting(false);
          setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length); 
        }
      }
    }, typeSpeed);

    return () => clearTimeout(timeoutId); 
  }, [currentText, isDeleting, currentWordIndex]); 

  return (

    <div style={{ display: 'inline-flex', flexDirection: 'column', width: '100%' }}>
      
      {/* 첫 번째 줄: 타이핑되는 가변 문장 영역 */}
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        <span>{currentText}</span>
        {/* 깜빡이는 커서 바를 글자 바로 뒤에 배치 */}
        <span style={{
          borderRight: `4px solid ${theme.purpleMain}`,
          animation: 'blink-cursor 0.8s infinite',
          marginLeft: '4px',
          height: '1em',
          display: 'inline-block'
        }}></span>
      </div>

      {/* 두 번째 줄*/}
      <div style={{ color: theme.textBlack, marginTop: '8px' }}>
        정가은입니다.
      </div>

      <style>{`
        @keyframes blink-cursor { 
          0%, 100% { opacity: 1; } 
          50% { opacity: 0; } 
        }
      `}</style>
    </div>
  );
}