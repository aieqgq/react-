# 좋은 은행 - 따뜻한 대출 신청 ☕

카페처럼 편안하고 따뜻한 금융 상담 서비스

## 🚀 Vercel 배포

### 1. GitHub에 올리기
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### 2. Vercel 배포
1. [vercel.com](https://vercel.com) 로그인
2. **Add New Project** → GitHub 저장소 연결
3. **Environment Variables** 설정 (필요 시):
   - `GEMINI_API_KEY` : Google AI Studio에서 발급받은 키
4. **Deploy** 클릭

> Vercel이 자동으로 `npm run build` 실행 후 `dist/` 폴더를 배포합니다.

---

## 💻 로컬 실행

**사전 조건:** Node.js 18+

```bash
# 패키지 설치
npm install --legacy-peer-deps

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build
```

### 환경변수 설정 (선택)
`.env.example`을 복사해 `.env.local` 파일을 만들고 값을 채워주세요:
```bash
cp .env.example .env.local
```

| 변수명 | 설명 |
|--------|------|
| `GEMINI_API_KEY` | Google Gemini API 키 ([발급](https://aistudio.google.com/apikey)) |

---

## 🛠 기술 스택

- **React 19** + **TypeScript**
- **Vite 8** (빌드 도구)
- **Tailwind CSS 4** (스타일링)
- **Lucide React** (아이콘)
- **Motion** (애니메이션)

---

© 2026 좋은 은행 (Good Bank). 당신의 하루에 빛을 더하다.
