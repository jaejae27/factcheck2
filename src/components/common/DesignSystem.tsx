import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Users,
  FileText,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Bot,
  Plus,
  ArrowRight,
  ArrowLeft,
  Award,
  BookOpen,
  Scale,
  Eye,
  Sliders,
  RotateCcw,
  Check,
  Send,
  MessageSquare,
  Clock,
  Download,
  Flame,
  ExternalLink,
  ChevronRight,
  Fingerprint,
  Cpu,
  Layers,
  Terminal,
  Activity,
  ShieldCheck,
  HelpCircle,
  X,
  Share2,
} from 'lucide-react';
import { StudentRole, VerdictType, EvidenceCard, Student, Team, Room } from '../../types';
import { ROLE_DEFINITIONS } from '../../data/topics';

// ==========================================
// 1. STATUS BADGE
// ==========================================
interface StatusBadgeProps {
  status: 'open' | 'analyzing' | 'verdict' | 'closed' | 'urgent' | 'online' | 'verified' | string;
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md', pulse = false }) => {
  let colorStyle = 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]';
  let defaultLabel = label || status.toUpperCase();

  switch (status.toLowerCase()) {
    case 'open':
      colorStyle = 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]';
      defaultLabel = label || 'STATUS: OPEN';
      break;
    case 'analyzing':
    case 'investigating':
      colorStyle = 'bg-blue-950/80 text-blue-400 border-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.2)]';
      defaultLabel = label || 'ANALYZING';
      break;
    case 'urgent':
    case 'help':
    case 'sos':
      colorStyle = 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse';
      defaultLabel = label || '지원 요청';
      break;
    case 'verdict':
      colorStyle = 'bg-purple-950/80 text-purple-300 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.2)]';
      defaultLabel = label || 'VERDICT';
      break;
    case 'closed':
    case 'completed':
      colorStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
      defaultLabel = label || 'CASE CLOSED';
      break;
    case 'online':
      colorStyle = 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
      defaultLabel = label || '● ONLINE';
      break;
    case 'supports':
      colorStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      defaultLabel = label || '가설 지지';
      break;
    case 'refutes':
      colorStyle = 'bg-rose-950/80 text-rose-300 border-rose-500/40';
      defaultLabel = label || '반증 / 반박';
      break;
    case 'conditional':
      colorStyle = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      defaultLabel = label || '조건부 증거';
      break;
  }

  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-bold tracking-wider rounded-md border backdrop-blur-sm ${colorStyle} ${sizeStyle}`}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
      {defaultLabel}
    </span>
  );
};

// ==========================================
// 2. PROGRESS BAR (HUD STYLE)
// ==========================================
interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  color?: 'cyan' | 'amber' | 'emerald' | 'purple';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = true,
  color = 'cyan',
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const barColor = {
    cyan: 'bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
    amber: 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    purple: 'bg-gradient-to-r from-purple-500 to-indigo-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
  }[color];

  return (
    <div className="space-y-1.5 w-full">
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-[11px] font-mono">
          {label && <span className="text-slate-400 font-bold uppercase tracking-wider">{label}</span>}
          {showPercent && <span className="text-cyan-400 font-black">{clamped}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-slate-900/90 rounded-full border border-slate-800 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

// ==========================================
// 3. INVESTIGATION PANEL (CONTAINER)
// ==========================================
interface InvestigationPanelProps {
  title?: React.ReactNode;
  systemTag?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'amber' | 'coral' | 'emerald' | 'none';
  rightElement?: React.ReactNode;
}

export const InvestigationPanel: React.FC<InvestigationPanelProps> = ({
  title,
  systemTag,
  subtitle,
  children,
  className = '',
  glow = 'cyan',
  rightElement,
}) => {
  const glowBorder = {
    cyan: 'border-cyan-500/25 shadow-[0_0_20px_rgba(6,182,212,0.06)]',
    amber: 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)]',
    coral: 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.08)]',
    emerald: 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)]',
    none: 'border-slate-800',
  }[glow];

  return (
    <div className={`relative bg-slate-950/85 backdrop-blur-xl border rounded-2xl p-5 sm:p-6 transition-all duration-300 ${glowBorder} ${className}`}>
      {/* HUD Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400/60 rounded-br-sm pointer-events-none" />

      {/* Header */}
      {(title || systemTag || subtitle || rightElement) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800/80">
          <div>
            {systemTag && (
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase block mb-1">
                // {systemTag}
              </span>
            )}
            {title && <h3 className="text-base sm:text-lg font-black text-white tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>}
          </div>
          {rightElement && <div className="shrink-0 flex items-center gap-2">{rightElement}</div>}
        </div>
      )}

      {children}
    </div>
  );
};

// ==========================================
// 4. CASE FILE CARD
// ==========================================
interface CaseFileCardProps {
  caseNumber?: string;
  category: string;
  claim: string;
  description?: string;
  status?: string;
  selected?: boolean;
  onSelect?: () => void;
  onViewDetails?: () => void;
}

export const CaseFileCard: React.FC<CaseFileCardProps> = ({
  caseNumber = 'CASE 011',
  category,
  claim,
  description,
  status = 'OPEN',
  selected = false,
  onSelect,
  onViewDetails,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`relative bg-slate-950/90 rounded-2xl border p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
        selected
          ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
          : 'border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/60'
      }`}
    >
      {/* Top Meta */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
              {caseNumber}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-900 text-slate-400 border border-slate-800">
              {category}
            </span>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Claim */}
        <h4 className="text-base font-bold text-white group-hover:text-cyan-200 transition leading-snug">
          {claim}
        </h4>

        {description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
        <span className="text-[11px] font-mono text-cyan-400/80 font-bold group-hover:text-cyan-300 flex items-center gap-1">
          수사 사건 배정 <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
        </span>
        {onViewDetails && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
          >
            사건 상세 보기
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 5. MISSION CARD / TERMINAL
// ==========================================
interface MissionCardProps {
  missionTitle: string;
  roleBadge: string;
  instructions: string;
  checklist: { label: string; checked: boolean; onToggle?: () => void }[];
  progressPercent: number;
  onActionClick?: () => void;
  actionLabel?: string;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  missionTitle,
  roleBadge,
  instructions,
  checklist,
  progressPercent,
  onActionClick,
  actionLabel = '증거 등록',
}) => {
  return (
    <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-[0_0_20px_rgba(6,182,212,0.1)] space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
            MISSION DIRECTIVE
          </span>
          <h3 className="text-base sm:text-lg font-black text-white mt-0.5 flex items-center gap-2">
            {missionTitle}
          </h3>
        </div>
        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
          {roleBadge}
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        {instructions}
      </p>

      {/* Checklist */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-mono font-bold text-slate-400 block">// REQUIRED VERIFICATION STEPS</span>
        {checklist.map((item, idx) => (
          <label
            key={idx}
            onClick={item.onToggle}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
              item.checked
                ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center border ${
              item.checked ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-600'
            }`}>
              {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className="font-medium">{item.label}</span>
          </label>
        ))}
      </div>

      {/* Progress & Action */}
      <div className="pt-3 border-t border-slate-800 space-y-3">
        <ProgressBar value={progressPercent} label="PROGRESS" />
        {onActionClick && (
          <button
            onClick={onActionClick}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 6. EVIDENCE CARD VIEW (HUD CARD)
// ==========================================
interface EvidenceCardViewProps {
  card: EvidenceCard;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export const EvidenceCardView: React.FC<EvidenceCardViewProps> = ({
  card,
  index,
  onEdit,
  onDelete,
  onClick,
}) => {
  const stanceInfo = {
    supports: { label: '가설 지지', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' },
    refutes: { label: '반증 / 반박', color: 'bg-rose-950/80 text-rose-300 border-rose-500/40' },
    conditional: { label: '조건부 증거', color: 'bg-amber-950/80 text-amber-300 border-amber-500/40' },
  }[card.stance || 'supports'];

  return (
    <div
      onClick={onClick}
      className="bg-slate-950/90 rounded-2xl border border-slate-800 hover:border-cyan-500/40 p-4 sm:p-5 transition flex flex-col justify-between space-y-3 shadow-md group relative"
    >
      <div className="space-y-2">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-black text-cyan-400">
            E-{String(index + 1).padStart(3, '0')}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${stanceInfo.color}`}>
            {stanceInfo.label}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition">
          {card.title}
        </h4>

        {/* Key Content */}
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
          {card.keyContent}
        </p>

        {/* Meta */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400 font-mono">
          <p className="truncate">
            출처: <span className="text-slate-200 font-sans">{card.publisher || '미기재'}</span>
            {card.isOriginalSource ? ' (1차 원문)' : ' (2차 인용)'}
          </p>
          {card.keyMetrics && (
            <p className="text-cyan-300 font-sans">
              핵심 데이터: <strong>{card.keyMetrics}</strong>
            </p>
          )}
          {card.authorName && (
            <p className="text-slate-500">수사관: {card.authorName}</p>
          )}
        </div>

        {card.imageUrl && (
          <img
            src={card.imageUrl}
            alt="증거 캡처"
            className="max-h-28 rounded-lg object-contain bg-slate-900 border border-slate-800 mx-auto"
          />
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="px-2.5 py-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition"
            >
              수정
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="px-2.5 py-1 text-[11px] font-mono text-rose-400 hover:text-rose-300 transition"
            >
              삭제
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 7. INVESTIGATOR ID CARD
// ==========================================
interface InvestigatorCardProps {
  student: Student;
  team: Team;
  room: Room;
}

export const InvestigatorCard: React.FC<InvestigatorCardProps> = ({ student, team, room }) => {
  const roleDef = student.role ? ROLE_DEFINITIONS[student.role] : null;

  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-[#071328] rounded-2xl border border-cyan-500/30 p-5 shadow-[0_0_20px_rgba(6,182,212,0.15)] overflow-hidden">
      {/* Digital watermark */}
      <Fingerprint className="absolute -right-6 -bottom-6 w-32 h-32 text-cyan-500/5 pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
              FACT LAB INVESTIGATOR ID
            </span>
          </div>
          <h3 className="text-lg font-black text-white mt-1">
            {student.name} <span className="text-xs font-mono font-normal text-slate-400">({room.grade}학년 {room.classNumber}반 {student.studentNumber}번)</span>
          </h3>
        </div>

        <div className="text-right">
          <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold">
            {team.teamName}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
        <div>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">SPECIALIST ROLE</span>
          <span className="font-bold text-cyan-300">{roleDef ? roleDef.title : '역할 배정 대기'}</span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">ASSIGNED CASE</span>
          <span className="font-bold text-slate-200 truncate block">{team.topicTitle || '사건 미배정'}</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. VERDICT BADGE (5-LEVELS)
// ==========================================
export const VerdictBadge: React.FC<{ verdict?: VerdictType | string; size?: 'sm' | 'md' | 'lg' }> = ({
  verdict,
  size = 'md',
}) => {
  const getStyle = () => {
    switch (verdict) {
      case 'true':
        return { label: '🟢 사실 (TRUE)', bg: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]' };
      case 'mostly_true':
        return { label: '🟢 대체로 사실 (MOSTLY TRUE)', bg: 'bg-teal-950/90 text-teal-300 border-teal-500/60 shadow-[0_0_12px_rgba(20,184,166,0.3)]' };
      case 'half_true':
      case 'conditional':
        return { label: '🟡 조건에 따라 다름 (CONDITIONAL)', bg: 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]' };
      case 'mostly_false':
        return { label: '🔴 대체로 사실 아님 (MOSTLY FALSE)', bg: 'bg-orange-950/90 text-orange-300 border-orange-500/60 shadow-[0_0_12px_rgba(249,115,22,0.3)]' };
      case 'false':
        return { label: '🔴 사실 아님 (FALSE)', bg: 'bg-rose-950/90 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]' };
      case 'insufficient_evidence':
      case 'needs_more_investigation':
        return { label: '⚪ 판정 유보 (PENDING)', bg: 'bg-slate-900 text-slate-300 border-slate-700' };
      default:
        return { label: '판정 대기', bg: 'bg-slate-900 text-slate-500 border-slate-800' };
    }
  };

  const info = getStyle();
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-xs sm:text-sm font-bold',
    lg: 'px-5 py-2.5 text-base sm:text-lg font-black',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-xl border font-mono tracking-wide ${info.bg} ${sizeClasses}`}>
      {info.label}
    </span>
  );
};

// ==========================================
// 9. COMMAND CENTER TEAM CARD (TEACHER)
// ==========================================
interface CommandCenterCardProps {
  team: Team;
  evidenceCount: number;
  hasCounterEvidence: boolean;
  investigation?: any;
  onAnalyzeClick: () => void;
  onHelpResolve?: () => void;
}

export const CommandCenterCard: React.FC<CommandCenterCardProps> = ({
  team,
  evidenceCount,
  hasCounterEvidence,
  investigation,
  onAnalyzeClick,
  onHelpResolve,
}) => {
  const isSOS = team.helpRequested;

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between space-y-4 ${
        isSOS
          ? 'bg-amber-950/30 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
          : 'bg-slate-950/90 border-slate-800 hover:border-cyan-500/40'
      }`}
    >
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-cyan-400">
              TEAM {String(team.teamNumber).padStart(2, '0')}
            </span>
            <span className="text-xs font-bold text-white">{team.teamName}</span>
          </div>
          <StatusBadge
            status={isSOS ? 'urgent' : team.currentStep >= 10 ? 'verdict' : 'analyzing'}
            label={isSOS ? '지원 요청' : undefined}
            size="sm"
          />
        </div>

        {/* Case Claim */}
        <p className="text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed">
          {team.topicTitle || team.claim || '사건 선택 대기'}
        </p>

        {/* Progress bar */}
        <ProgressBar value={team.progressPercent || 0} label={`STEP ${team.currentStep || 1} / 12`} />

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">증거</span>
            <span className="font-bold text-cyan-300">{evidenceCount}건</span>
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">반증</span>
            <span className={`font-bold ${hasCounterEvidence ? 'text-emerald-400' : 'text-slate-500'}`}>
              {hasCounterEvidence ? '확보완료' : '미탐색'}
            </span>
          </div>
        </div>

        {isSOS && team.helpReason && (
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200 space-y-1.5">
            <span className="font-bold font-mono text-[10px] uppercase text-amber-400 block">// SOS REASON</span>
            <p className="leading-snug">{team.helpReason}</p>
            {onHelpResolve && (
              <button
                onClick={onHelpResolve}
                className="w-full mt-1 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition"
              >
                도움 완료 처리
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onAnalyzeClick}
        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-cyan-950/80 text-cyan-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/50 font-mono text-xs font-bold transition flex items-center justify-center gap-1.5"
      >
        <Search className="w-3.5 h-3.5" />
        수사 현황 분석
      </button>
    </div>
  );
};

// ==========================================
// 10. HUD HEADER & FOOTER
// ==========================================
export const HudHeader: React.FC<{
  title?: string;
  subtitle?: string;
  badge?: string;
  rightSlot?: React.ReactNode;
}> = ({ title = 'FACT LAB : 팩트체크 수사본부', subtitle = 'DIGITAL INFORMATION INVESTIGATION BUREAU', badge = '2030 FORENSIC SYSTEM', rightSlot }) => {
  return (
    <header className="px-5 py-3.5 bg-slate-950/90 border-b border-cyan-500/20 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-black text-sm sm:text-base text-white tracking-tight">{title}</h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {badge}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 tracking-wider uppercase">{subtitle}</p>
        </div>
      </div>
      {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
    </header>
  );
};

export const HudFooter: React.FC = () => {
  return (
    <footer className="px-5 py-4 bg-slate-950 border-t border-slate-900 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-bold text-white text-xs">FACT LAB : 팩트체크 수사본부</span>
          <span className="text-slate-600 font-mono">|</span>
          <span className="text-[11px] text-slate-400 font-mono">DIGITAL INFORMATION INVESTIGATION BUREAU</span>
        </div>

        {/* 5 Core Competencies */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-slate-300">🧠 비판적 사고</span>
          <span className="flex items-center gap-1 text-slate-300">🔍 증거 기반 판단</span>
          <span className="flex items-center gap-1 text-slate-300">🌐 정보 검증 능력</span>
          <span className="flex items-center gap-1 text-slate-300">👥 협력과 소통</span>
          <span className="flex items-center gap-1 text-slate-300">🛡️ 디지털 시민성</span>
        </div>

        <p className="text-[11px] text-slate-500 text-center md:text-right">
          "좋은 수사관은 처음부터 정답을 아는 사람이 아니라, 증거를 확인하고 판단을 바꿀 수 있는 사람입니다."
        </p>
      </div>
    </footer>
  );
};

// ==========================================
// 11. HIGH-FIDELITY EVIDENCE BOARD (SCREEN A)
// ==========================================
interface EvidenceBoardProps {
  hypothesis: string;
  evidenceList: EvidenceCard[];
  unresolvedQuestions?: string[];
  onAddEvidenceClick?: () => void;
  onEditEvidenceClick?: (card: EvidenceCard) => void;
}

export const EvidenceBoard: React.FC<EvidenceBoardProps> = ({
  hypothesis,
  evidenceList,
  unresolvedQuestions = ['연령별 차이가 있을까?', '내용의 종류에 따라 다를까?'],
  onAddEvidenceClick,
  onEditEvidenceClick,
}) => {
  const supports = evidenceList.filter((e) => e.stance === 'supports');
  const refutesOrConditional = evidenceList.filter((e) => e.stance === 'refutes' || e.stance === 'conditional');

  return (
    <div className="relative bg-slate-950/95 rounded-3xl border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.1)] space-y-6 overflow-hidden">
      {/* Background HUD Grid */}
      <div className="absolute inset-0 bg-grid-lab opacity-50 pointer-events-none" />

      {/* Board Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 relative z-10">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
            DIGITAL FORENSIC BOARD // CROSS-EVIDENCE MAP
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">EVIDENCE BOARD (증거 종합 보드)</h3>
        </div>
        {onAddEvidenceClick && (
          <button
            onClick={onAddEvidenceClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            증거 추가 등록
          </button>
        )}
      </div>

      {/* Main 3-Column Interactive Forensic Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left Column: 가설을 지지하는 증거 */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 가설을 지지하는 증거 ({supports.length})
            </span>
          </div>

          <div className="space-y-3">
            {supports.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                아직 지지 증거가 등록되지 않았습니다.
              </div>
            ) : (
              supports.map((ev, idx) => (
                <div
                  key={ev.id}
                  onClick={() => onEditEvidenceClick?.(ev)}
                  className="bg-slate-900/90 rounded-2xl border border-emerald-500/30 hover:border-emerald-400 p-4 transition cursor-pointer shadow-md space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      E-{String(idx + 1).padStart(3, '0')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{ev.publisher}</span>
                  </div>
                  <h5 className="text-xs font-bold text-white group-hover:text-emerald-200 transition line-clamp-1">
                    {ev.title}
                  </h5>
                  <p className="text-[11px] text-slate-300 line-clamp-2">{ev.keyContent}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center Column: 우리의 가설 (Central Node) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-cyan-950/40 via-slate-900/90 to-slate-950 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] text-center space-y-3 relative">
          {/* Connector Glow Indicators */}
          <div className="hidden lg:block absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-400" />
          <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-gradient-to-r from-cyan-400 to-amber-500" />

          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            // OUR HYPOTHESIS
          </span>
          <h4 className="text-base sm:text-lg font-black text-white leading-relaxed">
            "{hypothesis || '가설을 작성해 주세요.'}"
          </h4>
          <p className="text-[11px] text-slate-400 font-mono">
            증거와 반증을 대조하여 진실을 판정합니다.
          </p>
        </div>

        {/* Right Column: 반대 / 조건부 증거 */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> 반증 / 조건부 증거 ({refutesOrConditional.length})
            </span>
          </div>

          <div className="space-y-3">
            {refutesOrConditional.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                반대 증거나 예외 조건이 아직 없습니다.
              </div>
            ) : (
              refutesOrConditional.map((ev, idx) => (
                <div
                  key={ev.id}
                  onClick={() => onEditEvidenceClick?.(ev)}
                  className={`bg-slate-900/90 rounded-2xl border p-4 transition cursor-pointer shadow-md space-y-2 group ${
                    ev.stance === 'refutes'
                      ? 'border-rose-500/40 hover:border-rose-400'
                      : 'border-amber-500/40 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${ev.stance === 'refutes' ? 'text-rose-400' : 'text-amber-400'}`}>
                      E-{String(supports.length + idx + 1).padStart(3, '0')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{ev.publisher}</span>
                  </div>
                  <h5 className="text-xs font-bold text-white transition line-clamp-1">
                    {ev.title}
                  </h5>
                  <p className="text-[11px] text-slate-300 line-clamp-2">{ev.keyContent}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Bottom: 추가로 확인할 질문 */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2 relative z-10">
        <span className="text-[11px] font-mono font-bold text-slate-400 block uppercase">
          // UNRESOLVED RESEARCH QUESTIONS
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {unresolvedQuestions.map((q, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                Q{idx + 1}
              </span>
              <span className="truncate">{q}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
