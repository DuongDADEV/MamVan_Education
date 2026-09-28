import React, { useState, useEffect, useRef } from 'react';
import {
  Filter,
  X,
  RotateCcw,
  Calendar,
  Users,
  BookOpen,
  Award,
  Check,
  Search,
  ChevronDown,
} from 'lucide-react';
import { GlobalAnalyticsFilter } from '../../../analytics/types.ts';
import { ClassItem, StudentAccount } from '../../../services/types.ts';
import { SkillLevel } from '../../../types.ts';

interface AnalyticsFilterBarProps {
  classes: ClassItem[];
  students: StudentAccount[];
  topics: Array<{ id: string; title: string }>;
  filters: GlobalAnalyticsFilter;
  onChangeFilters: (newFilters: GlobalAnalyticsFilter) => void;
  onResetFilters: () => void;
}

const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  NHAN_BIET: 'Nhận biết',
  THONG_HIEU: 'Thông hiểu',
  PHAN_TICH: 'Phân tích',
  VAN_DUNG: 'Vận dụng',
};

const TIME_RANGE_OPTIONS: Array<{ key: GlobalAnalyticsFilter['timeRange']; label: string }> = [
  { key: '7d', label: '7 ngày qua' },
  { key: '30d', label: '30 ngày qua' },
  { key: 'this_week', label: 'Tuần này' },
  { key: '6w', label: '6 tuần (Kỳ học)' },
  { key: 'custom', label: 'Tùy chọn...' },
];

const ACTIVITY_TYPE_OPTIONS = [
  { key: 'all', label: 'Tất cả loại bài' },
  { key: 'practice', label: 'Phiếu luyện tập' },
  { key: 'quiz_1', label: 'Kiểm tra 1' },
  { key: 'quiz_2', label: 'Kiểm tra 2' },
];

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  classes,
  students,
  topics,
  filters,
  onChangeFilters,
  onResetFilters,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đếm các bộ lọc đang kích hoạt khác mặc định
  const activeChips: Array<{ key: string; label: string; onRemove: () => void }> = [];

  // Lớp
  if (filters.classIds.length > 0) {
    const classNames = filters.classIds
      .map((cid) => classes.find((c) => c.id === cid)?.name || cid)
      .join(', ');
    activeChips.push({
      key: 'classes',
      label: `Lớp: ${classNames}`,
      onRemove: () => onChangeFilters({ ...filters, classIds: [] }),
    });
  }

  // Thời gian
  if (filters.timeRange !== '6w') {
    const tr = TIME_RANGE_OPTIONS.find((t) => t.key === filters.timeRange)?.label || filters.timeRange;
    activeChips.push({
      key: 'timeRange',
      label: `Thời gian: ${tr}`,
      onRemove: () => onChangeFilters({ ...filters, timeRange: '6w' }),
    });
  }

  // Chủ đề
  if (filters.topicId && filters.topicId !== 'all') {
    const tName = topics.find((t) => t.id === filters.topicId)?.title || filters.topicId;
    activeChips.push({
      key: 'topic',
      label: `Chủ đề: ${tName}`,
      onRemove: () => onChangeFilters({ ...filters, topicId: 'all' }),
    });
  }

  // Học sinh
  if (filters.studentIds.length > 0) {
    const sNames = filters.studentIds
      .map((sid) => students.find((s) => s.id === sid)?.name || sid)
      .join(', ');
    activeChips.push({
      key: 'students',
      label: `Học sinh: ${sNames}`,
      onRemove: () => onChangeFilters({ ...filters, studentIds: [] }),
    });
  }

  // Mức năng lực
  if (filters.skillLevels.length > 0 && filters.skillLevels.length < 4) {
    const lvlNames = filters.skillLevels.map((l) => SKILL_LEVEL_LABELS[l]).join(', ');
    activeChips.push({
      key: 'skills',
      label: `Mức: ${lvlNames}`,
      onRemove: () =>
        onChangeFilters({
          ...filters,
          skillLevels: ['NHAN_BIET', 'THONG_HIEU', 'PHAN_TICH', 'VAN_DUNG'],
        }),
    });
  }

  // Loại bài
  if (filters.activityType && filters.activityType !== 'all') {
    const act = ACTIVITY_TYPE_OPTIONS.find((a) => a.key === filters.activityType)?.label || filters.activityType;
    activeChips.push({
      key: 'activityType',
      label: `Bài: ${act}`,
      onRemove: () => onChangeFilters({ ...filters, activityType: 'all' }),
    });
  }

  // Toggle chọn lớp
  const handleToggleClass = (cid: string) => {
    let next: string[];
    if (filters.classIds.includes(cid)) {
      next = filters.classIds.filter((id) => id !== cid);
    } else {
      next = [...filters.classIds, cid];
    }
    onChangeFilters({ ...filters, classIds: next });
  };

  // Toggle chọn học sinh
  const handleToggleStudent = (sid: string) => {
    let next: string[];
    if (filters.studentIds.includes(sid)) {
      next = filters.studentIds.filter((id) => id !== sid);
    } else {
      next = [...filters.studentIds, sid];
    }
    onChangeFilters({ ...filters, studentIds: next });
  };

  // Toggle chọn mức năng lực
  const handleToggleSkill = (lvl: SkillLevel) => {
    let next: SkillLevel[];
    if (filters.skillLevels.includes(lvl)) {
      if (filters.skillLevels.length === 1) return; // Giữ ít nhất 1 mức
      next = filters.skillLevels.filter((l) => l !== lvl);
    } else {
      next = [...filters.skillLevels, lvl];
    }
    onChangeFilters({ ...filters, skillLevels: next });
  };

  // Lọc danh sách học sinh theo ô tìm kiếm
  const candidateStudents = students.filter((s) => {
    // Nếu có chọn lớp thì chỉ hiển thị học sinh thuộc các lớp đó
    if (filters.classIds.length > 0 && !filters.classIds.includes(s.class_id)) {
      return false;
    }
    if (!studentSearchQuery.trim()) return true;
    const q = studentSearchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.student_code ? s.student_code.toLowerCase().includes(q) : false);
  });

  return (
    <div
      ref={dropdownRef}
      className="sticky top-0 z-20 bg-[#FFFDF8]/95 backdrop-blur-md border border-[#E6DCC8] rounded-2xl p-3 sm:p-4 shadow-sm mb-6 transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* NHÓM CÁC NÚT BỘ LỌC CHÍNH */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF5EB] text-[#2F3E6B] font-bold text-xs border border-[#E6DCC8]">
            <Filter className="w-3.5 h-3.5 text-[#E2704A]" />
            <span>Bộ lọc:</span>
          </div>

          {/* 1. LỚP (MULTI-SELECT) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'class' ? null : 'class')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                filters.classIds.length > 0
                  ? 'bg-[#2F3E6B] text-white border-[#2F3E6B]'
                  : 'bg-[#FAF5EB] text-[#2F3E6B] border-[#E6DCC8] hover:bg-[#F2E8D5]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>
                {filters.classIds.length === 0
                  ? 'Tất cả các lớp'
                  : filters.classIds.length === 1
                  ? classes.find((c) => c.id === filters.classIds[0])?.name || '1 lớp'
                  : `${filters.classIds.length} lớp`}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {openDropdown === 'class' && (
              <div className="absolute left-0 mt-2 w-52 bg-[#FFFDF8] border border-[#E6DCC8] rounded-2xl shadow-xl p-2 z-30 space-y-1">
                <button
                  type="button"
                  onClick={() => onChangeFilters({ ...filters, classIds: [] })}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    filters.classIds.length === 0 ? 'bg-[#FAF5EB] text-[#2F3E6B]' : 'hover:bg-slate-50'
                  }`}
                >
                  <span>Tất cả các lớp</span>
                  {filters.classIds.length === 0 && <Check className="w-3.5 h-3.5 text-[#2F3E6B]" />}
                </button>
                <div className="border-t border-[#E6DCC8]/60 my-1" />
                {classes.map((c) => {
                  const isChecked = filters.classIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleToggleClass(c.id)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between hover:bg-[#FAF5EB]"
                    >
                      <span>Lớp {c.name}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded border-[#D1D5DB] text-[#2F3E6B] focus:ring-0"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. THỜI GIAN */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'time' ? null : 'time')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                filters.timeRange !== '6w'
                  ? 'bg-[#2F3E6B] text-white border-[#2F3E6B]'
                  : 'bg-[#FAF5EB] text-[#2F3E6B] border-[#E6DCC8] hover:bg-[#F2E8D5]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {TIME_RANGE_OPTIONS.find((t) => t.key === filters.timeRange)?.label || 'Thời gian'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {openDropdown === 'time' && (
              <div className="absolute left-0 mt-2 w-48 bg-[#FFFDF8] border border-[#E6DCC8] rounded-2xl shadow-xl p-2 z-30 space-y-1">
                {TIME_RANGE_OPTIONS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      onChangeFilters({ ...filters, timeRange: t.key });
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      filters.timeRange === t.key
                        ? 'bg-[#FAF5EB] text-[#2F3E6B]'
                        : 'text-[#4B5563] hover:bg-slate-50'
                    }`}
                  >
                    <span>{t.label}</span>
                    {filters.timeRange === t.key && <Check className="w-3.5 h-3.5 text-[#2F3E6B]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. CHỦ ĐỀ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'topic' ? null : 'topic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                filters.topicId && filters.topicId !== 'all'
                  ? 'bg-[#2F3E6B] text-white border-[#2F3E6B]'
                  : 'bg-[#FAF5EB] text-[#2F3E6B] border-[#E6DCC8] hover:bg-[#F2E8D5]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="max-w-[120px] truncate">
                {filters.topicId && filters.topicId !== 'all'
                  ? topics.find((t) => t.id === filters.topicId)?.title || '1 chủ đề'
                  : 'Tất cả chủ đề'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {openDropdown === 'topic' && (
              <div className="absolute left-0 mt-2 w-64 bg-[#FFFDF8] border border-[#E6DCC8] rounded-2xl shadow-xl p-2 z-30 max-h-64 overflow-y-auto space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    onChangeFilters({ ...filters, topicId: 'all' });
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    !filters.topicId || filters.topicId === 'all'
                      ? 'bg-[#FAF5EB] text-[#2F3E6B]'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <span>Tất cả chủ đề</span>
                  {(!filters.topicId || filters.topicId === 'all') && (
                    <Check className="w-3.5 h-3.5 text-[#2F3E6B]" />
                  )}
                </button>
                {topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onChangeFilters({ ...filters, topicId: t.id });
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${
                      filters.topicId === t.id
                        ? 'bg-[#FAF5EB] text-[#2F3E6B] font-bold'
                        : 'text-[#4B5563] hover:bg-[#FAF5EB]'
                    }`}
                  >
                    <span className="truncate">{t.title}</span>
                    {filters.topicId === t.id && <Check className="w-3.5 h-3.5 text-[#2F3E6B]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. HỌC SINH (SEARCH & MULTI-SELECT) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'student' ? null : 'student')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                filters.studentIds.length > 0
                  ? 'bg-[#2F3E6B] text-white border-[#2F3E6B]'
                  : 'bg-[#FAF5EB] text-[#2F3E6B] border-[#E6DCC8] hover:bg-[#F2E8D5]'
              }`}
            >
              <span>
                {filters.studentIds.length === 0
                  ? 'Tất cả học sinh'
                  : `${filters.studentIds.length} học sinh`}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {openDropdown === 'student' && (
              <div className="absolute left-0 mt-2 w-72 bg-[#FFFDF8] border border-[#E6DCC8] rounded-2xl shadow-xl p-3 z-30 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm tên hoặc mã học sinh..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF5EB] border border-[#E6DCC8] text-xs text-[#2F3E6B] focus:outline-none focus:border-[#2F3E6B]"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto space-y-1">
                  <button
                    type="button"
                    onClick={() => onChangeFilters({ ...filters, studentIds: [] })}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      filters.studentIds.length === 0 ? 'bg-[#FAF5EB] text-[#2F3E6B]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span>Tất cả học sinh</span>
                    {filters.studentIds.length === 0 && <Check className="w-3.5 h-3.5 text-[#2F3E6B]" />}
                  </button>
                  {candidateStudents.map((s) => {
                    const isChecked = filters.studentIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleToggleStudent(s.id)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-[#FAF5EB]"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#2F3E6B]">{s.name}</span>
                          <span className="text-[10px] text-[#9CA3AF]">{s.student_code}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="rounded border-[#D1D5DB] text-[#2F3E6B] focus:ring-0"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. MỨC NĂNG LỰC */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'skill' ? null : 'skill')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                filters.skillLevels.length > 0 && filters.skillLevels.length < 4
                  ? 'bg-[#2F3E6B] text-white border-[#2F3E6B]'
                  : 'bg-[#FAF5EB] text-[#2F3E6B] border-[#E6DCC8] hover:bg-[#F2E8D5]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>
                {filters.skillLevels.length === 4
                  ? 'Đủ 4 mức'
                  : `${filters.skillLevels.length} mức`}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {openDropdown === 'skill' && (
              <div className="absolute left-0 mt-2 w-48 bg-[#FFFDF8] border border-[#E6DCC8] rounded-2xl shadow-xl p-2 z-30 space-y-1">
                {(['NHAN_BIET', 'THONG_HIEU', 'PHAN_TICH', 'VAN_DUNG'] as SkillLevel[]).map((lvl) => {
                  const isChecked = filters.skillLevels.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleToggleSkill(lvl)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between hover:bg-[#FAF5EB]"
                    >
                      <span>{SKILL_LEVEL_LABELS[lvl]}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded border-[#D1D5DB] text-[#2F3E6B] focus:ring-0"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 6. LOẠI BÀI */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'activity' ? null : 'activity')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                filters.activityType && filters.activityType !== 'all'
                  ? 'bg-[#2F3E6B] text-white border-[#2F3E6B]'
                  : 'bg-[#FAF5EB] text-[#2F3E6B] border-[#E6DCC8] hover:bg-[#F2E8D5]'
              }`}
            >
              <span>
                {ACTIVITY_TYPE_OPTIONS.find((a) => a.key === filters.activityType)?.label || 'Loại bài'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {openDropdown === 'activity' && (
              <div className="absolute left-0 mt-2 w-48 bg-[#FFFDF8] border border-[#E6DCC8] rounded-2xl shadow-xl p-2 z-30 space-y-1">
                {ACTIVITY_TYPE_OPTIONS.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => {
                      onChangeFilters({ ...filters, activityType: a.key as any });
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      filters.activityType === a.key
                        ? 'bg-[#FAF5EB] text-[#2F3E6B]'
                        : 'text-[#4B5563] hover:bg-slate-50'
                    }`}
                  >
                    <span>{a.label}</span>
                    {filters.activityType === a.key && <Check className="w-3.5 h-3.5 text-[#2F3E6B]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* NÚT XÓA BỘ LỌC */}
        {activeChips.length > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#E2704A] bg-[#E2704A]/10 hover:bg-[#E2704A]/20 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa bộ lọc ({activeChips.length})</span>
          </button>
        )}
      </div>

      {/* DÒNG HIỂN THỊ CHIP CÁC BỘ LỌC ĐANG BẬT */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-[#E6DCC8]/60">
          <span className="text-[11px] text-[#78716C] font-medium">Đang lọc theo:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2F3E6B]/10 text-[#2F3E6B] text-xs font-medium border border-[#2F3E6B]/20 animate-fade-in"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="hover:bg-[#2F3E6B]/20 rounded-full p-0.5 transition-colors"
                aria-label={`Bỏ bộ lọc ${chip.label}`}
              >
                <X className="w-3 h-3 text-[#2F3E6B]" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
