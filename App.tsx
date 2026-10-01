/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Coffee,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Clock,
  HelpCircle,
  Percent,
} from 'lucide-react';

/**
 * 대출 상품별 타입 정의
 */
type LoanType = 'youth' | 'general' | 'creditTier1';

/**
 * 대출 상품 메타데이터 인터페이스
 */
interface LoanProductInfo {
  id: LoanType;
  title: string;
  tagline: string;
  interestRate: number; // 연이율 (%)
  amounts: number[]; // 대출 가능 금액 목록 (원 단위)
  description: string;
}

/**
 * 대출 상품별 세부 데이터 (요구사항 반영)
 * - 청년대출: 300만, 500만, 1000만원
 * - 일반대출: 500만, 1000만, 3000만원
 * - 신용 1등급 대출: 700만, 1000만, 2000만, 3000만원
 */
const LOAN_PRODUCTS: Record<LoanType, LoanProductInfo> = {
  youth: {
    id: 'youth',
    title: '청년대출',
    tagline: '꿈을 향해 나아가는 청년을 위한 따뜻한 응원',
    interestRate: 3.2,
    amounts: [3_000_000, 5_000_000, 10_000_000],
    description: '만 19세~34세 청년을 위한 저금리 맞춤형 금융 상품',
  },
  general: {
    id: 'general',
    title: '일반대출',
    tagline: '일상의 든든한 버팀목이 되어 드립니다',
    interestRate: 4.5,
    amounts: [5_000_000, 10_000_000, 30_000_000],
    description: '직장인 및 사업자를 위한 표준 안심 생활안정자금 대출',
  },
  creditTier1: {
    id: 'creditTier1',
    title: '신용1등급 대출',
    tagline: '우량 신용 고객님만을 위한 최고 우대 금리 혜택',
    interestRate: 2.8,
    amounts: [7_000_000, 10_000_000, 20_000_000, 30_000_000],
    description: '신용점수 우수 고객을 위한 무보증 프리미엄 한도 우대',
  },
};

/**
 * 기본 유의사항 문구
 */
const DEFAULT_NOTICE = `[좋은 은행 대출 신청 유의사항]
1. 본 신청서는 정식 심사를 위한 상담 접수 주문서입니다.
2. 신청 접수 후 전문 금융 상담 매니저가 1영업일 이내에 유선으로 안내드립니다.
3. 고객님의 신용도 및 소득 기준에 따라 최종 한도와 적용 금리가 달라질 수 있습니다.
4. 중도상환 수수료는 전액 면제되며, 언제든 부담 없이 상환하실 수 있습니다.
5. 과도한 빚은 개인에게 큰 부담이 될 수 있으니 신중하게 계획 후 이용 바랍니다.`;

/**
 * 접수 완료 데이터 인터페이스
 */
interface SubmittedOrder {
  receiptId: string;
  name: string;
  phone: string;
  loanTypeName: string;
  amount: number;
  interestRate: number;
  monthlyInterest: number;
  submittedAt: string;
  notice: string;
}

export default function App() {
  // [1] 입력 폼 상태 관리
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType>('youth');
  // 대출금액: 선택된 상품의 첫 번째 금액으로 기본 초기화
  const [selectedAmount, setSelectedAmount] = useState<number>(LOAN_PRODUCTS.youth.amounts[0]);
  // 유의사항 공지 (사용자가 확인하거나 추가 메모 가능)
  const [notice, setNotice] = useState<string>(DEFAULT_NOTICE);
  // 개인정보 및 유의사항 확인 체크박스
  const [isAgreed, setIsAgreed] = useState<boolean>(true);

  // [2] 폼 유효성 검사 에러 메시지 상태
  const [nameError, setNameError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [agreeError, setAgreeError] = useState<string>('');

  // [3] 신청 완료 상태 (제출 후 확인 메시지 표시용)
  const [submittedData, setSubmittedData] = useState<SubmittedOrder | null>(null);

  // 현재 선택된 상품 정보
  const currentProduct = LOAN_PRODUCTS[selectedLoanType];

  /**
   * 전화번호 입력 시 자동으로 하이픈(010-XXXX-XXXX) 포맷팅
   */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    let formatted = rawVal;
    if (rawVal.length > 3 && rawVal.length <= 7) {
      formatted = `${rawVal.slice(0, 3)}-${rawVal.slice(3)}`;
    } else if (rawVal.length > 7) {
      formatted = `${rawVal.slice(0, 3)}-${rawVal.slice(3, 7)}-${rawVal.slice(7, 11)}`;
    }
    setPhone(formatted);
    if (phoneError) setPhoneError('');
  };

  /**
   * 이름 변경 핸들러
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (nameError) setNameError('');
  };

  /**
   * 대출 종류 변경 핸들러
   * - 종류가 바뀌면 해당 상품의 지원 가능 금액 중 첫 번째 금액으로 자동 동기화
   */
  const handleLoanTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as LoanType;
    setSelectedLoanType(newType);
    const availableAmounts = LOAN_PRODUCTS[newType].amounts;
    // 현재 선택된 금액이 새 상품의 금액 목록에 없으면 첫 번째 금액으로 자동 변경
    if (!availableAmounts.includes(selectedAmount)) {
      setSelectedAmount(availableAmounts[0]);
    }
  };

  /**
   * 대출 금액 라디오 버튼 변경 핸들러
   */
  const handleAmountChange = (amount: number) => {
    setSelectedAmount(amount);
  };

  /**
   * [다시 작성] 버튼 핸들러
   * - 요구사항: 모든 입력값과 금액을 초기화
   */
  const handleReset = () => {
    setName('');
    setPhone('');
    setSelectedLoanType('youth');
    setSelectedAmount(LOAN_PRODUCTS.youth.amounts[0]);
    setNotice(DEFAULT_NOTICE);
    setIsAgreed(true);
    setNameError('');
    setPhoneError('');
    setAgreeError('');
    setSubmittedData(null);
  };

  /**
   * [주문하기] / [대출 요청] 버튼 핸들러
   * - 유효성 검사 후 대출 접수 완료 처리
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    // 이름 필수 검증
    if (!name.trim()) {
      setNameError('이름을 입력해 주세요.');
      hasError = true;
    } else {
      setNameError('');
    }

    // 전화번호 필수 검증
    if (!phone.trim()) {
      setPhoneError('전화번호를 입력해 주세요.');
      hasError = true;
    } else if (phone.replace(/[^0-9]/g, '').length < 10) {
      setPhoneError('올바른 연락처 번호 10~11자리를 입력해 주세요.');
      hasError = true;
    } else {
      setPhoneError('');
    }

    // 약관 동의 검증
    if (!isAgreed) {
      setAgreeError('유의사항 및 개인정보 수집·이용에 동의해 주세요.');
      hasError = true;
    } else {
      setAgreeError('');
    }

    if (hasError) return;

    // 월 예상 이자 계산 (원금 * 연이율 / 12)
    const monthlyInterest = Math.round((selectedAmount * (currentProduct.interestRate / 100)) / 12);

    // 접수증 데이터 생성
    const newSubmission: SubmittedOrder = {
      receiptId: `GB-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      phone: phone.trim(),
      loanTypeName: currentProduct.title,
      amount: selectedAmount,
      interestRate: currentProduct.interestRate,
      monthlyInterest,
      submittedAt: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      notice,
    };

    setSubmittedData(newSubmission);

    // 상단으로 부드럽게 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 월 예상 이자 산출 (단위: 원, toLocaleString 적용)
  const estimatedMonthlyInterest = Math.round(
    (selectedAmount * (currentProduct.interestRate / 100)) / 12
  );

  return (
    <div className="min-h-screen py-8 px-4 flex flex-col items-center justify-start bg-[#faf6f0]">
      {/* 
        [전체 디자인 가이드]
        - 최대 너비 520px, 가운데 정렬 (max-w-[520px] mx-auto)
        - 카페 느낌의 따뜻한 베이지(#faf6f0) 및 브라운(#6b4226) 컬러 구성
      */}
      <div className="w-full max-w-[520px] mx-auto">
        {/* =========================================================
            1. [페이지 상단]: 은행 로고, 카페 이름, 부제
           ========================================================= */}
        <header className="text-center mb-6 pt-2">
          {/* 은행 로고: 따뜻한 커피와 온화한 빛의 은행 엠블럼 */}
          <div className="inline-flex items-center justify-center mb-3">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#6b4226] to-[#8c5835] text-white flex items-center justify-center shadow-md border-2 border-[#d7ccc8]">
              {/* 김이 모락모락 피어오르는 커피잔 아이콘 */}
              <Coffee className="w-8 h-8 text-[#fff3e0]" strokeWidth={2.2} />
              {/* 온기 가득한 빛 스파클 장식 */}
              <span className="absolute -top-1 -right-1 bg-[#ffb300] text-white p-1 rounded-full shadow">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* 카페 이름: "좋은 은행" */}
          <h1 className="text-2xl font-extrabold text-[#6b4226] tracking-tight">
            좋은 은행
          </h1>

          {/* 부제: "당신의 하루에 빛을 더하다" */}
          <p className="text-sm font-medium text-[#8d6e63] mt-1">
            당신의 하루에 빛을 더하다
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#f5eee6] border border-[#e0d6cb] rounded-full text-xs text-[#6b4226] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#6b4226] animate-pulse"></span>
            카페처럼 편안하고 따뜻한 금융 상담 서비스
          </div>
        </header>

        {/* =========================================================
            2. [대출 확인 메시지]: 연두색 배경, 초록 글씨, 둥근 모서리
               (주문/신청 완료 시 상단에 따뜻하게 표시)
           ========================================================= */}
        {submittedData && (
          <section
            aria-live="polite"
            className="mb-6 p-5 rounded-2xl bg-[#edf7ed] border border-[#c8e6c9] text-[#1b5e20] shadow-sm animate-fade-in"
          >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#c8e6c9]/60">
              <CheckCircle2 className="w-6 h-6 text-[#2e7d32] shrink-0" />
              <div>
                <h2 className="text-base font-bold text-[#1b5e20]">
                  대출 신청 접수가 완료되었습니다
                </h2>
                <p className="text-xs text-[#2e7d32]">
                  접수번호: <span className="font-mono font-semibold">{submittedData.receiptId}</span> ({submittedData.submittedAt})
                </p>
              </div>
            </div>

            {/* 주문 영수증 요약 카드 */}
            <div className="bg-white/80 rounded-xl p-3.5 text-xs text-[#2e7d32] space-y-1.5 border border-[#c8e6c9]/50">
              <div className="flex justify-between items-center">
                <span className="text-[#388e3c]">신청인</span>
                <span className="font-bold text-[#1b5e20] text-sm">{submittedData.name} 님</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#388e3c]">연락처</span>
                <span className="font-medium text-[#1b5e20]">{submittedData.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#388e3c]">선택 상품</span>
                <span className="font-semibold text-[#1b5e20]">{submittedData.loanTypeName} (연 {submittedData.interestRate}%)</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#c8e6c9]/40">
                <span className="text-[#388e3c] font-medium">신청 금액</span>
                <span className="font-bold text-base text-[#1b5e20]">
                  {/* 요구사항: 금액은 천 단위 콤마 표시 (toLocaleString) */}
                  {submittedData.amount.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-[#4caf50]">
                <span>월 예상 이자 (추정)</span>
                <span>약 {submittedData.monthlyInterest.toLocaleString()}원</span>
              </div>
            </div>

            <p className="mt-3 text-xs text-[#2e7d32] leading-relaxed">
              ☕ 따뜻한 커피 한 잔 드시는 동안, 전담 금융 매니저가 연락처(
              {submittedData.phone})로 친절히 연락드리겠습니다.
            </p>

            <button
              type="button"
              onClick={() => setSubmittedData(null)}
              className="mt-3 w-full py-1.5 px-3 bg-white text-[#2e7d32] border border-[#a5d6a7] rounded-lg text-xs font-semibold hover:bg-[#f1f8e9] transition-colors"
            >
              확인 및 안내 닫기
            </button>
          </section>
        )}

        {/* =========================================================
            3. [대출 주문서 카드]: 둥근 모서리, 부드러운 그림자
           ========================================================= */}
        <main className="bg-white rounded-2xl shadow-md border border-[#e8ded2] p-6 mb-8">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#f0e7dc]">
            <div>
              <h2 className="text-lg font-bold text-[#6b4226] flex items-center gap-1.5">
                <span>📋</span> 대출 신청 주문서
              </h2>
              <p className="text-xs text-[#8d6e63] mt-0.5">
                필요하신 자금을 편안하게 선택해 주세요.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#6b4226] bg-[#faf6f0] px-2.5 py-1 rounded-full border border-[#e2d5c5]">
              당일 심사
            </span>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* -----------------------------------------------------
                [항목 1] 이름 (필수, text)
                - 모든 input에 label 연결 (htmlFor="customerName")
               ----------------------------------------------------- */}
            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-bold text-[#4a2c17] mb-1.5"
              >
                1. 성명 (이름) <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={name}
                onChange={handleNameChange}
                placeholder="예: 홍길동"
                required
                className="cafe-input"
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {nameError}
                </p>
              )}
            </div>

            {/* -----------------------------------------------------
                [항목 2] 전화번호 (tel)
                - 모든 input에 label 연결 (htmlFor="customerPhone")
               ----------------------------------------------------- */}
            <div>
              <label
                htmlFor="customerPhone"
                className="block text-sm font-bold text-[#4a2c17] mb-1.5"
              >
                2. 전화번호 <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-1234-5678"
                maxLength={13}
                required
                className="cafe-input"
              />
              {phoneError && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {phoneError}
                </p>
              )}
              <p className="text-[11px] text-[#8d6e63] mt-1">
                ※ 대출 심사 결과 및 상담 안내 문자 메시지가 발송됩니다.
              </p>
            </div>

            {/* -----------------------------------------------------
                [항목 3] 대출종류 선택 (드롭다운)
                - 청년대출, 일반대출, 신용1등급 대출
                - 모든 input에 label 연결 (htmlFor="loanTypeSelect")
               ----------------------------------------------------- */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="loanTypeSelect"
                  className="block text-sm font-bold text-[#4a2c17]"
                >
                  3. 대출종류 선택
                </label>
                <span className="text-xs text-[#8d6e63]">
                  현재 연이율: <strong className="text-[#6b4226]">{currentProduct.interestRate}%</strong>
                </span>
              </div>
              <div className="relative">
                <select
                  id="loanTypeSelect"
                  name="loanTypeSelect"
                  value={selectedLoanType}
                  onChange={handleLoanTypeChange}
                  className="cafe-input pr-10 cursor-pointer appearance-none bg-no-repeat font-medium"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b4226'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px 16px',
                  }}
                >
                  <option value="youth">청년대출 (연 3.2% 우대)</option>
                  <option value="general">일반대출 (연 4.5% 표준)</option>
                  <option value="creditTier1">신용1등급 대출 (연 2.8% 특판)</option>
                </select>
              </div>

              {/* 선택된 대출 상품에 대한 따뜻한 설명 배너 */}
              <div className="mt-2 p-2.5 rounded-lg bg-[#faf6f0] border border-[#e8ded2] text-xs text-[#6b4226]">
                <p className="font-semibold">{currentProduct.tagline}</p>
                <p className="text-[#8d6e63] text-[11px] mt-0.5">{currentProduct.description}</p>
              </div>
            </div>

            {/* -----------------------------------------------------
                [항목 4] 대출금액 (라디오 버튼, 가로 배치)
                - 청년대출: 300, 500, 1000만원
                - 일반대출: 500, 1000, 3000만원
                - 신용 1등급 대출: 700, 1000, 2000, 3000만원
                - 라디오/체크박스: 가로로 나란히 배치, gap 간격
                - 모든 input에 label 연결
               ----------------------------------------------------- */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-[#4a2c17]">
                  4. 대출금액 선택
                </label>
                <span className="text-xs text-[#8d6e63]">
                  원하시는 한도를 체크해 주세요
                </span>
              </div>

              {/* 라디오 버튼 가로 나란히 배치 (flex flex-wrap gap-2.5) */}
              <div className="flex flex-wrap items-center gap-2.5" role="radiogroup" aria-label="대출금액 선택">
                {currentProduct.amounts.map((amount) => {
                  const inputId = `amount-${selectedLoanType}-${amount}`;
                  const isChecked = selectedAmount === amount;
                  // 만원 단위 표기 변환
                  const amountInTenThousand = amount / 10_000;

                  return (
                    <label
                      key={inputId}
                      htmlFor={inputId}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-150 select-none ${
                        isChecked
                          ? 'bg-[#f7efe7] border-[#6b4226] text-[#6b4226] shadow-sm'
                          : 'bg-white border-[#d7ccc8] text-[#5d4037] hover:bg-[#faf6f0] hover:border-[#bcaaa4]'
                      }`}
                    >
                      <input
                        type="radio"
                        id={inputId}
                        name="loanAmount"
                        value={amount}
                        checked={isChecked}
                        onChange={() => handleAmountChange(amount)}
                        className="cafe-radio"
                      />
                      <span>{amountInTenThousand.toLocaleString()}만원</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* -----------------------------------------------------
                [예상 금액]: 큰 글씨(24px), 갈색, 굵게, 가운데 정렬
                - 금액은 천 단위 콤마 표시 (toLocaleString)
               ----------------------------------------------------- */}
            <div className="my-6 p-4 rounded-xl bg-[#faf6f0] border border-[#e8ded2] text-center">
              <span className="text-xs font-semibold text-[#8d6e63] block mb-1">
                신청 예상 대출 금액
              </span>
              {/* 요구사항: 큰 글씨(24px), 갈색(#6b4226), 굵게, 가운데 정렬 */}
              <div className="text-[24px] font-bold text-[#6b4226] text-center tracking-tight">
                {selectedAmount.toLocaleString()}원
              </div>
              <div className="mt-2 flex items-center justify-center gap-4 text-xs text-[#8d6e63]">
                <span className="inline-flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-[#6b4226]" />
                  적용 금리: 연 {currentProduct.interestRate}%
                </span>
                <span className="text-[#d7ccc8]">|</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#6b4226]" />
                  월 예상 이자: 약 {estimatedMonthlyInterest.toLocaleString()}원
                </span>
              </div>
            </div>

            {/* -----------------------------------------------------
                [항목 7] 유의사항 공지 (textarea)
                - 모든 input/textarea에 label 연결 (htmlFor="noticeNotice")
               ----------------------------------------------------- */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="noticeNotice"
                  className="block text-sm font-bold text-[#4a2c17]"
                >
                  7. 유의사항 공지
                </label>
                <span className="text-xs text-[#8d6e63]">
                  신청 전 필독
                </span>
              </div>
              <textarea
                id="noticeNotice"
                name="noticeNotice"
                rows={5}
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                className="cafe-input font-normal text-xs leading-relaxed resize-none text-[#5d4037] bg-[#fffdfa]"
                placeholder="유의사항 및 특별 요청사항을 확인하세요."
              />
            </div>

            {/* 동의 체크박스: 가로 배치, gap 간격, label 연결 */}
            <div className="pt-1">
              <label
                htmlFor="agreeTerms"
                className="flex items-start gap-2.5 cursor-pointer text-xs text-[#5d4037]"
              >
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={isAgreed}
                  onChange={(e) => {
                    setIsAgreed(e.target.checked);
                    if (agreeError) setAgreeError('');
                  }}
                  className="mt-0.5 cafe-radio"
                />
                <span>
                  <strong className="text-[#4a2c17]">[필수]</strong> 위 대출 유의사항을 모두 확인하였으며,
                  상담을 위한 개인정보(이름, 연락처) 수집 및 이용에 동의합니다.
                </span>
              </label>
              {agreeError && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {agreeError}
                </p>
              )}
            </div>

            {/* -----------------------------------------------------
                [항목 8 & 9]: 주문하기 버튼 & 다시 작성 버튼
                - 주문하기: 갈색 배경(#6b4226), 흰색 글씨, hover시 약간 밝게
                - 다시 작성: 모든 입력과 금액 초기화
               ----------------------------------------------------- */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {/* 주문하기 / 대출 요청 버튼 */}
              <button
                type="submit"
                className="flex-1 py-3 px-5 rounded-lg bg-[#6b4226] text-white font-bold text-base hover:bg-[#7f4f2f] active:bg-[#5a361e] shadow-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>대출 주문하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* 다시 작성 버튼 */}
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-5 rounded-lg bg-[#f5eee6] text-[#6b4226] font-semibold text-sm hover:bg-[#e8ded2] active:bg-[#ded2c4] border border-[#d7ccc8] transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>다시 작성</span>
              </button>
            </div>
          </form>
        </main>

        {/* =========================================================
            4. 하단 안심 안내 푸터
           ========================================================= */}
        <footer className="text-center text-xs text-[#8d6e63] space-y-2 pb-8">
          <div className="flex items-center justify-center gap-3">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6b4226]" />
              개인정보 암호화 보호
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-[#6b4226]" />
              상담 문의: 1588-0000
            </span>
          </div>
          <p>© 2026 좋은 은행 (Good Bank). 당신의 하루에 빛을 더하다.</p>
        </footer>
      </div>
    </div>
  );
}
