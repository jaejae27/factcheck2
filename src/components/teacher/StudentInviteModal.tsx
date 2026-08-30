import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ExternalLink,
  Shield,
  Lock,
  Unlock,
  QrCode,
  Radio,
  Sparkles,
  Smartphone,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Room } from '../../types';
import { toggleRoomJoinLock } from '../../lib/db';

interface StudentInviteModalProps {
  room: Room;
  onClose: () => void;
}

export const StudentInviteModal: React.FC<StudentInviteModalProps> = ({ room, onClose }) => {
  const [isBigScreenMode, setIsBigScreenMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCodeText, setShowCodeText] = useState(true);
  const [isLocking, setIsLocking] = useState(false);

  // Compute student join URL with room code query parameter
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const joinUrl = `${origin}/?room=${room.roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleOpenStudentTab = () => {
    window.open(joinUrl, '_blank');
  };

  const handleToggleLock = async () => {
    try {
      setIsLocking(true);
      await toggleRoomJoinLock(room.id, !room.lockJoin);
    } catch (err) {
      console.error('Error toggling room join lock:', err);
    } finally {
      setIsLocking(false);
    }
  };

  // 1. ELECTRONIC BLACKBOARD / FULLSCREEN QR VIEW
  if (isBigScreenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#040814] flex flex-col items-center justify-between p-6 sm:p-12 text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header in Big Screen */}
        <div className="w-full max-w-5xl flex items-center justify-between border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  FACT LAB GATEWAY
                </span>
                <span className="text-xs text-slate-400">수사본부 학생 초대 전광판</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
                {room.grade}학년 {room.classNumber}반 · {room.title || '팩트체크 수사본부'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBigScreenMode(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-slate-600 transition"
            >
              <Minimize2 className="w-4 h-4" />
              일반 모달로 축소
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Center Mega QR & Code Display */}
        <div className="my-auto flex flex-col items-center text-center max-w-2xl w-full py-4 space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-sm font-bold font-mono animate-pulse">
              <Radio className="w-4 h-4 text-cyan-400" />
              실시간 학생 접속 대기 중
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              스마트폰 / 태블릿 카메라로 QR을 스캔하세요
            </h2>
            <p className="text-slate-400 text-base">
              QR코드를 촬영하거나 입장 링크에 접속한 뒤 반·번호·이름을 확인하고 수사본부에 입장하세요.
            </p>
          </div>

          {/* High Contrast Crisp QR Canvas */}
          <div className="relative p-6 bg-white rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.3)] border-4 border-cyan-400 flex flex-col items-center">
            <QRCodeSVG
              value={joinUrl}
              size={280}
              level="H"
              includeMargin={false}
              className="w-56 h-56 sm:w-72 sm:h-72"
            />
            <span className="mt-3 text-[11px] font-mono text-slate-700 font-bold tracking-wider">
              SCAN TO JOIN FACT LAB
            </span>
          </div>

          {/* Room Code Badge */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-slate-400 font-mono font-bold tracking-wider">수사본부 참여코드</span>
            <div className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-slate-900/90 border-2 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
              <span className="font-mono text-3xl sm:text-4xl font-black text-amber-400 tracking-[0.25em]">
                {room.roomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition"
                title="코드 복사"
              >
                {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copiedCode && (
              <span className="text-xs text-emerald-400 font-bold animate-in fade-in">
                ✓ 입장 코드를 복사했습니다.
              </span>
            )}
          </div>
        </div>

        {/* Bottom Status & Controls */}
        <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>수사본부 주소: {joinUrl}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold transition flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? '링크 복사됨' : '입장 링크 복사'}
            </button>
            <button
              onClick={handleOpenStudentTab}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              학생 화면 테스트 열기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. STANDARD COMPACT MODAL
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-cyan-500/20 bg-[#091224] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  STUDENT ACCESS GATE
                </span>
                <span className="text-xs text-slate-400">
                  {room.grade}학년 {room.classNumber}반 ({room.period}차시)
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">FACT LAB 학생 초대</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Top Instruction Banner */}
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-cyan-300 font-bold block mb-0.5">학생 접속 안내</strong>
              “QR코드를 촬영하거나 입장 링크에 접속한 뒤 반·번호·이름을 확인하고 수사본부에 입장하세요.”
            </div>
          </div>

          {/* QR Code & Direct Join Panel */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-950/60 rounded-2xl border border-slate-800">
            {/* High Contrast QR */}
            <div className="p-4 bg-white rounded-2xl border-2 border-cyan-400 shadow-md shrink-0 flex flex-col items-center">
              <QRCodeSVG
                value={joinUrl}
                size={160}
                level="H"
                includeMargin={false}
                className="w-36 h-36"
              />
              <span className="mt-1.5 text-[9px] font-mono text-slate-800 font-bold">
                FACT LAB QR
              </span>
            </div>

            {/* Room Info & Quick Buttons */}
            <div className="flex-1 w-full space-y-3">
              {/* Room Code with Show/Hide toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>수업방 참여코드</span>
                  <button
                    onClick={() => setShowCodeText(!showCodeText)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {showCodeText ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showCodeText ? '코드 숨김' : '코드 표시'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xl font-black text-amber-400 tracking-widest text-center shadow-inner">
                    {showCodeText ? room.roomCode : '••••••'}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-1 shrink-0"
                    title="코드 복사"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedCode ? '복사됨' : '방번호 복사'}
                  </button>
                </div>
                {copiedCode && (
                  <p className="text-[11px] text-emerald-400 font-bold">✓ 입장 코드를 복사했습니다.</p>
                )}
              </div>

              {/* Join Link */}
              <div className="space-y-1 pt-1">
                <span className="text-xs text-slate-400 font-mono block">학생 입장 링크</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={joinUrl}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-slate-300 truncate focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black transition flex items-center gap-1 shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? '복사됨' : '링크 복사'}
                  </button>
                </div>
                {copiedLink && (
                  <p className="text-[11px] text-emerald-400 font-bold">✓ 입장 링크를 복사했습니다.</p>
                )}
              </div>
            </div>
          </div>

          {/* Teacher Controls: Big Screen & Lock Settings */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setIsBigScreenMode(true)}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30"
              >
                <Maximize2 className="w-4 h-4" />
                전자칠판용 QR 크게 보기
              </button>

              <button
                onClick={handleOpenStudentTab}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 hover:border-slate-500 transition flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                새 창으로 학생 입장 화면 열기
              </button>
            </div>

            {/* Room Join Lock Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${room.lockJoin ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {room.lockJoin ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    학생 추가 입장 잠금: {room.lockJoin ? 'ON (신규 차단)' : 'OFF (자유 입장)'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {room.lockJoin ? '신규 학생의 진입을 차단합니다 (기존 학생 재접속은 허용)' : '수업 중 늦게 온 학생도 언제든지 중도 입장할 수 있습니다'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleToggleLock}
                disabled={isLocking}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  room.lockJoin
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {room.lockJoin ? '잠금 해제' : '입장 잠그기'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#091224] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition font-mono"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
