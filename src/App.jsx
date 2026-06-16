import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaGithub, FaInstagram, FaBlog, FaEnvelope, FaPhone, FaLock, FaTrashAlt } from 'react-icons/fa';
// ⭐ GSAP 및 관련 플러그인/훅 임포트
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import TypingTitle from './TypingTitle';

// ⭐ ScrollTrigger 등록
gsap.registerPlugin(ScrollTrigger);

function App() {
  // --- [상태 관리: State] ---
  const [messages, setMessages] = useState([]);
  const [formData, setFormData] = useState({ name: '', password: '', message: '', isSecret: false });

  // 애니메이션 상태 변수 (스크롤 감지용)
  const [showAbout, setShowAbout] = useState(false);
  const [showProj1, setShowProj1] = useState(false);
  const [showProj2, setShowProj2] = useState(false);

  // 📬 편지 날아가기 및 우체통 꿀꺽 애니메이션 트리거 상태
  const [isFlying, setIsFlying] = useState(false);
  const [isEating, setIsEating] = useState(false);

  // 🔮 최근 메시지 탭 기본 접힘 상태 (기본값: false - 접힘 상태 🔒)
  const [isListOpen, setIsListOpen] = useState(false);

  // 🔑 관리자 스펙 확장 상태 변수
  const [isAdminMode, setIsAdminMode] = useState(false); 
  const [adminPassword, setAdminPassword] = useState(''); 
  const [showAdminLogin, setShowAdminLogin] = useState(false); 

  // --- [참조 변수: Ref] ---
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const projectsRef = useRef(null);
  const contactRef = useRef(null);

  const aboutSectionRef = useRef(null);
  const proj1Ref = useRef(null);
  const proj2Ref = useRef(null);

  const rippleContainerRef = useRef(null);

  // ⭐ 종이비행기 애니메이션을 위한 Ref
  const mainContainerRef = useRef(null);
  const planeRef = useRef(null);



  // ⭐ useGSAP 훅을 사용하여 스크롤 및 이미지 비율에 따른 비행 궤적 완벽 매칭
  useGSAP(() => {
    ScrollTrigger.getAll().forEach(t => t.kill());

    // 초기 위치: 화면 왼쪽 밖 상단 대기
    gsap.set(planeRef.current, {
      position: 'fixed',
      top: '35%',
      left: '0',
      x: '-250px',
      y: '-180px',
      rotation: 35,
      scale: 0.6, // 스크롤 시 컴포넌트 여백 안에 쏙 들어가도록 스케일 0.6으로 최적화
    });

    // 🟢 1단계: 페이지 첫 로드 시 부드러운 인트로 진입
    gsap.to(planeRef.current, {
      x: '30vw',
      y: '-8vh',
      rotation: 12,
      scale: 0.6,
      duration: 1.4,
      ease: 'power2.out',
      delay: 0.2,

      // 🟢 인트로 완료 후 타임라인 기반 스크롤 궤적 연결
      onComplete: () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: mainContainerRef.current,
            start: 'top top',
            end: '85% bottom',
            scrub: 1.2,
            invalidateOnRefresh: true,

            onLeave: () => {
              gsap.set(planeRef.current, { position: 'fixed' });
            },
            onEnterBack: () => {
              gsap.set(planeRef.current, { position: 'fixed' });
            },
            onLeaveBack: () => {
              gsap.set(planeRef.current, {
                position: 'fixed',
                x: '28vw',   
                y: '-15vh',  
                rotation: 12,
                scale: 0.8,
              });
            },
          }
        });

        tl
          // ① HOME → ABOUT ME: My Journey 타이틀 시작 지점 동그라미 여백 안착
          .to(planeRef.current, {
            x: '12vw', 
            y: '-5vh',
            rotation: 20,
            scale: 0.5,
            duration: 2,
            ease: 'power1.inOut',
          })
        





          // ② ABOUT ME → PROJECTS: ArtLens 카드 내부 타이틀 및 태그 옆 흰색 여백 정밀 착륙
          .to(planeRef.current, {
            x: '50vw', 
            y: '-15vh',
            rotation: 20,
            scale: 0.6,
            duration: 2,
            ease: 'power1.inOut'
          })


          // ③ PROJECTS → CONTACT: Send a Message 폼 상단 헤더 우측 여백에 최종 안착!
          .to(planeRef.current, {
            x: '110vw', 
            y: '-20vh',
            rotation: 30,
            scale: 1,
            duration: 2,
            ease: 'power1.out'
          });
          
        ScrollTrigger.refresh();
      }
    });

  }, { scope: mainContainerRef });


  // --- [이벤트 및 비동기 효과 처리] ---
  useEffect(() => {
    fetchMessages();

    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes dynamic-ripple {
        0% { width: 0px; height: 0px; opacity: 1; }
        100% { width: 150px; height: 150px; opacity: 0; }
      }
      
      @keyframes send-letter-animation {
        0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
        30% { transform: translate(40px, -20px) scaleY(0.4) scaleX(0.9) rotate(5deg); opacity: 0.9; }
        70% { transform: translate(210px, 40px) scale(0.3) rotate(30deg); opacity: 0.8; }
        100% { transform: translate(250px, 50px) scale(0) rotate(45deg); opacity: 0; }
      }

      .letter-flying {
        animation: send-letter-animation 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      }

      @keyframes mailbox-shake {
        0%, 100% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.05) rotate(-3deg); }
      }

      .mailbox-eating-active {
        animation: mailbox-shake 0.4s ease-in-out;
        animation-delay: 0.85s;
      }
    `;
    document.head.appendChild(styleSheet);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const isVisible = entry.isIntersecting;
        if (entry.target === aboutSectionRef.current) setShowAbout(isVisible);
        else if (entry.target === proj1Ref.current) setShowProj1(isVisible);
        else if (entry.target === proj2Ref.current) setShowProj2(isVisible);
      });
    }, { threshold: 0.15 });

    if (aboutSectionRef.current) observer.observe(aboutSectionRef.current);
    if (proj1Ref.current) observer.observe(proj1Ref.current);
    if (proj2Ref.current) observer.observe(proj2Ref.current);

    const createRipple = (e) => {
      const container = rippleContainerRef.current;
      if (!container) return;

      const drop = document.createElement('span');
      
      Object.assign(drop.style, {
        position: 'absolute', left: `${e.clientX}px`, top: `${e.clientY}px`,
        width: '6px', height: '6px', backgroundColor: 'rgba(155, 122, 221, 0.08)', 
        border: '1px solid rgba(155, 122, 221, 0.2)', borderRadius: '50%',
        pointerEvents: 'none', transform: 'translate(-50%, -50%)',
        animation: 'dynamic-ripple 1.5s ease-out forwards' 
      });

      container.appendChild(drop);
      setTimeout(() => { drop.remove(); }, 1500);
    };

    let lastTime = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastTime > 40) {
        createRipple(e);
        lastTime = now;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
      styleSheet.remove();
    };
  }, []);

  const scrollToSection = (elementRef) => {
    window.scrollTo({
      top: elementRef.current.offsetTop - 100,
      behavior: 'smooth'
    });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/guestbook');
      if (Array.isArray(response.data)) setMessages(response.data);
    } catch (error) {
      setMessages([
        { id: 1, name: "김커피", message: "보낼 내용을 입력하세요 창이 아주 직관적이네요!", isSecret: false },
        { id: 2, name: "이티", message: "비밀 메시지 예시입니다.", isSecret: true }
      ]);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("이 방명록 메시지를 서버에서 영구 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/guestbook/${id}`);
      alert('데이터베이스에서 메시지가 안전하게 소거되었습니다.');
      fetchMessages();
    } catch (error) {
      setMessages(messages.filter(msg => msg.id !== id));
      alert('백엔드 연동 전 임시 테스트: 화면에서 메시지를 필터링 소거했습니다.');
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === '1201') { 
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setIsListOpen(true); 
      alert('관리자 인증에 성공했습니다. [삭제 권한 부여 완료]');
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
    setAdminPassword('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsFlying(true);
    setIsEating(true);

    try {
      await axios.post('/api/guestbook', formData);
      
      setTimeout(() => {
        alert('✔️메세지 감사합니다. 빠른 시일 내 회신드리겠습니다!');
        setFormData({ name: '', password: '', message: '', isSecret: false });
        setIsFlying(false); 
        setIsEating(false);
        fetchMessages();
      }, 1200);

    } catch (error) {
      alert('등록에 실패했습니다.');
      setIsFlying(false);
      setIsEating(false);
    }
  };

  const theme = {
    purpleMain: '#7B5CAA',
    lavenderLight: '#E8DFF5',
    textBlack: '#2B2633',
    bgGray: '#F7F4FA'
  };

  const headerStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, height: '100px',
    backgroundColor: '#ffffff', borderBottom: '1px solid #E2DDE8',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 40px', zIndex: 1000, boxShadow: '0 2px 5px rgba(123, 92, 170, 0.05)'
  };

  const navLinkStyle = { marginLeft: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', color: theme.textBlack };

  const sectionCommonStyle = {
    minHeight: 'calc(100vh - 100px)', padding: '100px 10% 40px 10%', boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column', justifyContent: 'center'
  };

  const contentAnimationStyle = (isTriggered) => ({
    opacity: isTriggered ? 1 : 0,
    transform: isTriggered ? 'translateY(0)' : 'translateY(50px)',
    transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
    transitionDelay: '0.2s'
  });

  const lineAnimationStyle = (isTriggered) => ({
    width: '100%', height: '2px', backgroundColor: theme.purpleMain, marginTop: '10px',
    transform: isTriggered ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left',
    transition: 'transform 0.8s ease-in-out'
  });

  const btnStyle = {
    display: 'inline-block', padding: '8px 18px', border: `1px solid ${theme.textBlack}`,
    borderRadius: '50px', color: theme.textBlack, textDecoration: 'none',
    fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', backgroundColor: 'transparent'
  };

  const btnDarkStyle = {
    ...btnStyle, backgroundColor: theme.purpleMain, color: 'white', borderColor: theme.purpleMain
  };

  return (
    <div ref={mainContainerRef} style={{ color: theme.textBlack, overflowX: 'hidden' }}>
      <div ref={rippleContainerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 99999, overflow: 'hidden' }}></div>

      {/* ✈️ 화면에 고정되어 날아다닐 종이비행기 레이어 */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '0', 
        zIndex: 9999,          
        pointerEvents: 'none'  
      }}>
        <img
          ref={planeRef}
          src="/plane.png"
          alt="Paper Plane"
          style={{
            width: '220px',
            height: 'auto',
            pointerEvents: 'none',
          }}
        />
      </div>











      {/* 내비게이션 바 */}
      <header style={headerStyle}>
        <div style={{ color: theme.purpleMain, fontWeight: '900', fontSize: '24px', cursor: 'pointer' }} onClick={() => scrollToSection(homeRef)}>👤 GE PORTFOLIO</div>
        <nav>
          <span style={navLinkStyle} onClick={() => scrollToSection(aboutRef)}>ABOUT ME</span>
          <span style={navLinkStyle} onClick={() => scrollToSection(projectsRef)}>PROJECTS</span>
          <span style={navLinkStyle} onClick={() => scrollToSection(contactRef)}>CONTACT</span>
        </nav>
      </header>

      {/* [Section 1] HOME */}
      <section ref={homeRef} style={{ marginTop: '100px', minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', backgroundColor: theme.lavenderLight, padding: '40px 15%', boxSizing: 'border-box' }}>
        <div style={{ flex: 1, paddingRight: '20px' }}>
          {/* 🟢 라이브러리 충돌 없는 무결점 타이핑 컴포넌트 매칭 완료 */}
          <div style={{ 
            fontSize: '42px', 
            color: theme.purpleMain, 
            margin: '0 0 20px 0', 
            lineHeight: '1.4',
            fontWeight: 'bold',
            minHeight: '120px', // 글자 지워졌을 때 버튼 출렁임 방지 구조 유지
            display: 'flex',
            alignItems: 'center'
          }}>
            <TypingTitle theme={theme} />
          </div>

          <p style={{ fontSize: '18px', color: theme.textBlack, marginBottom: '35px', lineHeight: '1.6' }}>
            깔끔한 코드,<br />차분하고 정교한 코드로 아키텍처를 설계합니다.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <a href="https://github.com" target="_blank" rel="noreferrer" style={btnStyle}>GitHub</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={btnStyle}>Instagram</a>
            <a 
  href="/resume.pdf" 
  download="정가은_이력서.pdf"
  style={btnDarkStyle}
>
  Resume 다운로드
</a>
          </div>
        </div>

        {/* 🔮 오른쪽 반응형 IDE 컴포넌트 구역 (가은이 오리지널 폰트 & 컬러 100% 보존) */}
        <div style={{ 
          flex: 1.2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          position: 'relative', 
          paddingLeft: '5%', // 💡 고정 px 대신 % 단위를 주어 화면 크기에 유연하게 대응
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            width: '100%', 
            maxWidth: '480px', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            backgroundColor: 'transparent', 
            position: 'relative',
            minWidth: '290px' // 💡 화면이 극단적으로 작아져도 깨지지 않는 마지노선
          }}>
            <img 
              src="/Untitled (1).png" 
              alt="Code Window Frame" 
              style={{ 
                width: '100%', 
                height: 'auto', 
                display: 'block', 
                backgroundColor: 'transparent', 
                objectFit: 'contain' 
              }} 
            />
            
            <pre style={{ 
              fontFamily: '"Pretendard Variable", Pretendard, Inter, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif', // 👈 가은이의 고딕 폰트 그대로 유지!
              position: 'absolute', 
              top: '12%',       // 💡 액자 이미지 비율에 맞춰 상단 여백 유동형 조절
              left: '0', 
              width: '100%', 
              height: '88%', 
              margin: 0, 
              padding: '6% 8%', // 💡 안쪽 패딩도 %로 유연하게 스케일링하여 삐져나옴 방지
              
              // 🟢 [반응형 폰트 수식] 화면 배율/크기에 따라 11px~14px 사이로 자동 줄어들고 커지는 반응형 핏!
              fontSize: 'clamp(11px, 1.1vw, 14px)', 
              
              lineHeight: '1.8', 
              textAlign: 'left', 
              boxSizing: 'border-box', 
              overflow: 'hidden', // 💡 우측/하단 스크롤바 강제 튀어나옴 완벽 방지
              pointerEvents: 'none' 
            }}>
              <div><span style={{ color: '#E91E63', fontWeight: 'bold' }}>const</span> <span style={{ color: '#39a518' }}>developer</span> = &#123;</div>
              <div style={{ paddingLeft: '1.5em' }}>name: <span style={{ color: '#8e24aa' }}>"정가은 (Jung Gaeun)"</span>,</div>
              <div style={{ paddingLeft: '1.5em' }}>role: <span style={{ color: '#2196F3' }}>"Frontend Developer"</span>,</div>
              <div style={{ paddingLeft: '1.5em' }}>coreSkills: <span style={{ color: '#8e24aa' }}>[</span><span style={{ color: '#2196F3' }}>"React"</span>, <span style={{ color: '#2196F3' }}>"Next.js"</span>, <span style={{ color: '#2196F3' }}>"Figma"</span><span style={{ color: '#8E24AA' }}>]</span>,</div>
              <div style={{ paddingLeft: '1.5em' }}>department: <span style={{ color: '#8e24aa' }}>"Computer Science"</span>,</div>
              <div style={{ paddingLeft: '1.5em' }}>status: <span style={{ color: '#8e24aa' }}>"4th Year University Student"</span>,</div>
              <div style={{ paddingLeft: '1.5em' }}>currentProject: <span style={{ color: '#8e24aa' }}>"ArtLens (AI Docent Service)"</span>,</div>
              <div style={{ paddingLeft: '1.5em' }}>motto: <span style={{ color: '#8e24aa' }}>"늘 배우고 감사하는 자세로"</span></div>
              <div>&#125;;</div>
            </pre>
          </div>
        </div>
      </section>

<section ref={aboutRef} style={{ ...sectionCommonStyle, backgroundColor: '#ffffff' }}>
  <div ref={aboutSectionRef} style={{ width: '100%' }}>
    <h2 style={{ fontSize: '28px', color: theme.purpleMain, margin: 0 }}>ABOUT ME</h2>
    <div style={lineAnimationStyle(showAbout)} />
    <div style={{ ...contentAnimationStyle(showAbout), display: 'flex', marginTop: '40px', gap: '50px' }}>
      
      {/* 왼쪽 단락: 학력 및 자격증 */}
      <div style={{ flex: 1 }}>
        <h3 style={{ color: theme.textBlack, margin: '0 0 15px 0' }}>Education</h3>
        
        
        <p style={{ lineHeight: '1.8', color: '#555', margin: 0 }}>
            <HighlightText text="- 수원대학교 컴퓨터공학과 (2024~재학)" theme={theme} />{' '}
          </p>

        <h4 style={{ marginTop: '30px', marginBottom: '10px' }}>Qualification</h4>
        <p style={{ lineHeight: '1.8', color: '#555', margin: 0 }}>
            <HighlightText text="정보처리기사, SQLD, ADSP, GTQ" theme={theme} />{' '}
          </p>
      </div>
      
      {/* 오른쪽 단락: 스킬 스택 (형광펜 연동 구역) */}
      <div style={{ flex: 1 }}>
        <h3 style={{ color: theme.textBlack, margin: '0 0 15px 0' }}>Skills</h3>
        
        {/* Frontend 기술 카드 */}
        <div style={{ backgroundColor: theme.bgGray, padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #dccbe3' }}>
          <strong style={{ color: theme.purpleMain }}>Frontend</strong>
          {/* 🟢 [수정 완료] 기존 텍스트들을 HighlightText 컴포넌트로 쏙쏙 변경했습니다! */}
          <p style={{ margin: '5px 0 0 0', color: '#555', lineHeight: '1.8' }}>
            <HighlightText text="React, JavaScript, Next.js, Figma" theme={theme} />{' '}
          </p>
        </div>
        
        {/* Backend 기술 카드 */}
        <div style={{ backgroundColor: theme.bgGray, padding: '20px', borderRadius: '12px', border: '1px solid #dccbe3' }}>
          <strong style={{ color: theme.purpleMain }}>Backend</strong>
          {/* 🟢 [수정 완료] 기존 텍스트들을 HighlightText 컴포넌트로 쏙쏙 변경했습니다! */}
          <p style={{ margin: '5px 0 0 0', color: '#555', lineHeight: '1.8' }}>
            <HighlightText text="Java, Spring Boot, MySQL" theme={theme} />{' '}
          </p>
        </div>

      </div>
    </div>
  </div>
</section>

      {/* [Section 3] PROJECTS 프로젝트 섹션 */}
      <section ref={projectsRef} style={{ ...sectionCommonStyle, backgroundColor: theme.bgGray }}>
        <h2 style={{ fontSize: '28px', color: theme.purpleMain, margin: 0 }}>PROJECTS</h2>
        <div style={lineAnimationStyle(showProj1 || showProj2)} />
        
        {/* --- [Card 1] ArtLens 팀 프로젝트 --- */}
        <div ref={proj1Ref} style={{ ...contentAnimationStyle(showProj1), display: 'flex', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', marginTop: '40px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(123, 92, 170, 0.05)' }}>
          
          {/* 📸 ArtLens 썸네일 영역 (클릭 시 실시간 사이트나 GitHub로 이동) */}
          <a 
            href="https://artslens.vercel.app" // 👈 배포된 ArtLens 주소나 GitHub 주소를 여기에 넣으세요!
            target="_blank" 
            rel="noreferrer"
            style={{ flex: 1.2, display: 'flex', overflow: 'hidden', cursor: 'pointer' }}
          >
            <img 
              src="/pj1.png" // 👈 public 폴더에 저장한 파일명과 정확히 매칭!
              alt="ArtLens Thumbnail" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                minHeight: '220px',
                transition: 'transform 0.3s ease' // 마우스 올렸을 때 부드러운 확대 효과
              }} 
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </a>

          <div style={{ flex: 1.8, padding: '30px' }}>
            <span style={{ backgroundColor: theme.purpleMain, color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>Frontend personal project</span>
            <h3 style={{ marginTop: '10px', fontSize: '20px', marginBottom: '10px' }}>ArtLens 개인 프로젝트</h3>
            <p style={{ color: '#555', lineHeight: '1.6', margin: '0 0 10px 0' }}>AI 기술을 이용한 작품 인식 및 키워드 선택을 통한 사용자 맞춤 TTS큐레이팅</p>
            <p style={{ fontSize: '14px', color: theme.textBlack, margin: 0 }}><strong>사용 기술:</strong> React, Next.js, Firebase, Gemini API</p>
          </div>
        </div>

        {/* --- [Card 2] 웹 프로그래밍 과제 프로젝트 --- */}
        <div ref={proj2Ref} style={{ ...contentAnimationStyle(showProj2), display: 'flex', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(123, 92, 170, 0.05)' }}>
          
          {/* 📸 웹 과제 썸네일 영역 (클릭 시 GitHub로 이동) */}
          <a 
            href="https://github.com" // 👈 과제 저장소 GitHub 주소를 여기에 넣으세요!
            target="_blank" 
            rel="noreferrer"
            style={{ flex: 1.2, display: 'flex', overflow: 'hidden', cursor: 'pointer' }}
          >
            <img 
              src="/pj2.png" // 👈 public 폴더에 저장한 파일명과 정확히 매칭!
              alt="Web Assignment Thumbnail" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                minHeight: '220px',
                transition: 'transform 0.3s ease'
              }} 
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </a>

          <div style={{ flex: 1.8, padding: '30px' }}>
            <span style={{ backgroundColor: '#8F859C', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>Full-stack team project</span>
            <h3 style={{ marginTop: '10px', fontSize: '20px', marginBottom: '10px' }}>공연 예약 사이트 팀 프로젝트</h3>
            <p style={{ color: '#555', lineHeight: '1.6', margin: '0 0 10px 0' }}>암표 방지 및 큐알을 이용한 수월한 입장이 가능한 공연 예약 사이트</p>
            <p style={{ fontSize: '14px', color: theme.textBlack, margin: 0 }}><strong>사용 기술:</strong>React, Spring Boot, MySQL</p>
          </div>
        </div>
      </section>

      {/* [Section 4] CONTACT & MESSAGING */}
      <section ref={contactRef} style={{ ...sectionCommonStyle, backgroundColor: '#ffffff', flexDirection: 'row', gap: '40px', alignItems: 'center' }}>
        <div style={{ flex: 0.9 }}>
          <h2 style={{ fontSize: '28px', color: theme.purpleMain, marginBottom: '20px', marginTop: 0 }}>GET IN TOUCH</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>언제나 따뜻한 제안과 피드백을 환영합니다. 아래 채널로 편하게 연락해 주세요.</p>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5', fontSize: '16px', margin: 0 }}>
            <li><FaEnvelope color={theme.purpleMain} /> <strong>Email:</strong> asdjlaads@naver.com</li>
            <li><FaInstagram color={theme.purpleMain} /> <strong>Instagram:</strong> @fdjfewHV</li>
            <li><FaBlog color={theme.purpleMain} /> <strong>Blog:</strong> dfgddf.tistory.com</li>
            <li><FaPhone color={theme.purpleMain} /> <strong>Phone:</strong> +82-10-8546-9531</li>
          </ul>
        </div>

        <div style={{ flex: 1.3, display: 'flex', alignItems: 'center', gap: '30px', position: 'relative' }}>
          <div className={isFlying ? 'letter-flying' : ''} style={{ flex: 1.2, backgroundColor: theme.bgGray, padding: '30px', borderRadius: '16px', border: '1px solid #E2DDE8', boxSizing: 'border-box', transition: 'all 0.5s' }}>
            <h3 style={{ margin: '0 0 20px 0', color: theme.purpleMain }}>Send a Message</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" name="name" placeholder="이름" value={formData.name} onChange={handleInputChange} required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <input type="password" name="password" placeholder="비밀번호" value={formData.password} onChange={handleInputChange} required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <textarea name="message" placeholder="보낼 내용을 입력하세요" value={formData.message} onChange={handleInputChange} required style={{ height: '70px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', resize: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" name="isSecret" checked={formData.isSecret} onChange={handleInputChange} style={{ marginRight: '6px' }} />
                  비밀 메시지로 처리 (나만 보기)
                </label>
                <button type="submit" style={btnDarkStyle}>보내기</button>
              </div>
            </form>
          </div>

          <div className={isEating ? 'mailbox-eating-active' : ''} style={{ flex: 0.8, display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'transform 0.3s' }}>
            <img src="/pngegg (1).png" alt="Mailbox" style={{ width: '280px', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }} />
          </div>
        </div>
      </section>

      {/* 목록 피드 단락 */}
      <section style={{ backgroundColor: theme.bgGray, padding: '40px 10% 80px 10%' }}>
        <div onClick={() => setIsListOpen(!isListOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '2px solid #E2DDE8', paddingBottom: '10px', marginBottom: '20px', userSelect: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h4 style={{ margin: 0, color: theme.textBlack, fontSize: '18px', fontWeight: 'bold' }}>Recent Messages</h4>
            {isAdminMode && <span style={{ fontSize: '11px', backgroundColor: '#10B981', color: 'white', padding: '2px 8px', borderRadius: '20px' }}>관리자 모드</span>}
          </div>
          <span style={{ fontSize: '14px', color: theme.purpleMain, fontWeight: 'bold' }}>
            {isListOpen ? '▲ 접기' : '▼ 펼치기'}
          </span>
        </div>

        {isListOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #E2DDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', paddingRight: '20px' }}>
                    <strong style={{ fontSize: '13px' }}>{msg.name}</strong>
                    <span style={{ fontSize: '10px', color: '#999' }}>2026.06.16</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: msg.isSecret ? '#cc0000' : '#444' }}>
                    {msg.isSecret && !isAdminMode ? "🔒 (비밀 메시지) 관리자만 확인 가능한 메시지입니다." : msg.message}
                  </p>
                </div>

                {isAdminMode && (
                  <button onClick={() => handleDeleteMessage(msg.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '10px', fontSize: '16px' }} title="이 메시지 삭제">
                    <FaTrashAlt />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 인앱 관리자 전환 콘솔 제어판 */}
        <div style={{ marginTop: '25px', textAlign: 'right' }}>
          {!isAdminMode ? (
            <div>
              {!showAdminLogin ? (
                <span onClick={() => setShowAdminLogin(true)} style={{ fontSize: '12px', color: '#9CA3AF', cursor: 'pointer', textDecoration: 'underline' }}>
                  <FaLock size={10} style={{ marginRight: '4px' }} /> 관리자 로그인
                </span>
              ) : (
                <form onSubmit={handleAdminLogin} style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                  <input type="password" placeholder="관리자 암호" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }} required />
                  <button type="submit" style={{ ...btnDarkStyle, padding: '4px 12px', fontSize: '11px', borderRadius: '4px' }}>인증</button>
                  <button type="button" onClick={() => setShowAdminLogin(false)} style={{ ...btnStyle, padding: '4px 12px', fontSize: '11px', borderRadius: '4px' }}>취소</button>
                </form>
              )}
            </div>
          ) : (
            <span onClick={() => setIsAdminMode(false)} style={{ fontSize: '12px', color: '#EF4444', cursor: 'pointer', textDecoration: 'underline' }}>
              관리자 로그아웃
            </span>
          )}
        </div>
      </section>

      <footer style={{ backgroundColor: '#211B28', color: '#9C93A6', padding: '20px 40px', textAlign: 'center', fontSize: '12px' }}>
        <p>Copyright © 2026 OOO. All rights reserved.</p>
      </footer>
    </div>
  );
}

const HighlightText = ({ text, theme }) => {
  const [isHovered, setIsHovered] = React.useState(false); // 💡 useState 에러 방지용 React.useState

  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        fontWeight: 'bold',
        display: 'inline-block',
        position: 'relative',
        padding: '0 4px',
        cursor: 'pointer',
        zIndex: 1,
      }}
    >
      {text}
      <span style={{
        position: 'absolute',
        bottom: '8%',
        left: 0,
        width: '100%',
        height: '70%',
        backgroundColor: 'rgba(234, 255, 0, 0.5)',
        zIndex: -1,
        transformOrigin: 'left',
        transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
        transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
      }} />
    </span>
  );
};

export default App;