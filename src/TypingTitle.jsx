import React, { useState, useEffect } from 'react';

export default function TypingTitle({ theme }) {
  // 🟢 [수정 1] "정가은입니다"를 제외하고, 앞에 바뀔 타이틀 키워드들만 배열로 관리해!
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
    // 🟢 [수정 2] 타이핑되는 글자와 커서 뒤에 고정될 ", 정가은입니다."를 한 구조 안에 묶어줍니다!
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

      {/* 두 번째 줄: 언제나 가만히 고정되어 있을 가은이 이름표 */}
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