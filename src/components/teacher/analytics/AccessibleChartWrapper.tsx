import React, { useState } from 'react';
import { Table, BarChart3, Download, Info } from 'lucide-react';
import { exportToExcel } from '../../../utils/exportUtils.ts';

export interface AccessibleChartWrapperProps {
  title: string;
  subtitle?: string;
  unitNote?: string;
  empty?: boolean;
  emptyMessage?: string;
  tableData?: Array<Record<string, any>>;
  tableColumns?: Array<{ key: string; label: string; format?: (val: any) => string }>;
  exportFileName?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  heightClass?: string;
  pedagogicalNote?: string;
}

export const AccessibleChartWrapper: React.FC<AccessibleChartWrapperProps> = ({
  title,
  subtitle,
  unitNote,
  empty = false,
  emptyMessage = 'Chưa đủ dữ liệu trong khoảng thời gian hoặc bộ lọc đã chọn.',
  tableData,
  tableColumns,
  exportFileName = 'du_lieu_bieu_do',
  children,
  headerAction,
  heightClass = 'min-h-[300px]',
  pedagogicalNote,
}) => {
  const [showTable, setShowTable] = useState(false);

  const handleExportTable = () => {
    if (!tableData || tableData.length === 0) return;
    const formattedData = tableData.map((row: any) => {
      const obj: Record<string, any> = {};
      if (tableColumns && tableColumns.length > 0) {
        tableColumns.forEach((c) => {
          obj[c.label] = c.format ? c.format(row[c.key]) : row[c.key] ?? '';
        });
      } else {
        Object.keys(row).forEach((k) => {
          obj[k] = row[k] ?? '';
        });
      }
      return obj;
    });

    exportToExcel(formattedData, exportFileName, title);
  };

  return (
    <div className="bg-[#FFFDF8] border border-[#E6DCC8] rounded-2xl p-5 shadow-xs transition-all relative flex flex-col justify-between">
      {/* HEADER BIỂU ĐỒ */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-lora font-bold text-base text-[#2F3E6B]">{title}</h3>
            {unitNote && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FAF5EB] border border-[#E6DCC8] text-[#78716C] font-medium">
                {unitNote}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
        </div>

        {/* CÁC NÚT ĐIỀU HƯỚNG / TIỆN ÍCH */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {headerAction}

          {tableData && tableData.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTable(!showTable)}
              aria-label={showTable ? 'Chuyển sang dạng biểu đồ' : 'Chuyển sang dạng bảng số liệu'}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                showTable
                  ? 'bg-[#2F3E6B] text-white border-[#2F3E6B]'
                  : 'bg-[#FAF5EB] text-[#2F3E6B] border-[#E6DCC8] hover:bg-[#F2E8D5]'
              }`}
              title="Xem bảng số liệu thay thế cho người dùng bàn phím/đọc màn hình"
            >
              {showTable ? <BarChart3 className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
              <span>{showTable ? 'Xem biểu đồ' : 'Xem bảng số'}</span>
            </button>
          )}

          {tableData && tableData.length > 0 && (
            <button
              type="button"
              onClick={handleExportTable}
              aria-label="Xuất dữ liệu biểu đồ ra Excel"
              className="p-1.5 rounded-xl text-xs font-medium border border-[#E6DCC8] bg-[#FAF5EB] text-[#2F3E6B] hover:bg-[#F2E8D5] transition-all"
              title="Xuất bảng số liệu này ra Excel"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* NỘI DUNG CHÍNH: EMPTY STATE HOẶC BẢNG SỐ HOẶC BIỂU ĐỒ */}
      {empty ? (
        <div
          className={`${heightClass} flex flex-col items-center justify-center text-center p-6 bg-[#FAF5EB]/50 border border-dashed border-[#E6DCC8] rounded-xl`}
        >
          <div className="w-10 h-10 rounded-full bg-[#E6DCC8]/50 flex items-center justify-center text-[#78716C] mb-2">
            <Info className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-[#2F3E6B]">Chưa đủ dữ liệu</p>
          <p className="text-xs text-[#78716C] max-w-sm mt-1">{emptyMessage}</p>
        </div>
      ) : showTable && tableData ? (
        /* BẢNG SỐ LIỆU THAY THẾ (ACCESSIBLE SEMANTIC TABLE) */
        <div className={`overflow-x-auto ${heightClass} flex flex-col justify-start`}>
          <div className="text-[11px] text-[#78716C] mb-2 italic">
            * Bảng dữ liệu dành cho truy cập dễ dàng bằng bàn phím hoặc thiết bị đọc màn hình.
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF5EB] border-b border-[#E6DCC8] text-[#2F3E6B]">
                {tableColumns
                  ? tableColumns.map((col) => (
                      <th key={col.key} scope="col" className="p-2.5 font-bold">
                        {col.label}
                      </th>
                    ))
                  : Object.keys(tableData[0] || {}).map((k) => (
                      <th key={k} scope="col" className="p-2.5 font-bold capitalize">
                        {k}
                      </th>
                    ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DCC8]/60">
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#FAF5EB]/40 transition-colors">
                  {tableColumns
                    ? tableColumns.map((col) => (
                        <td key={col.key} className="p-2.5 text-[#374151]">
                          {col.format ? col.format(row[col.key]) : String(row[col.key] ?? '—')}
                        </td>
                      ))
                    : Object.keys(row).map((k) => (
                        <td key={k} className="p-2.5 text-[#374151]">
                          {String(row[k] ?? '—')}
                        </td>
                      ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* BIỂU ĐỒ RECHARTS */
        <div className={`w-full ${heightClass} flex items-center justify-center`}>
          {children}
        </div>
      )}

      {/* CHÚ THÍCH SƯ PHẠM Ở CHÂN BIỂU ĐỒ NẾU CÓ */}
      {pedagogicalNote && (
        <div className="mt-3 pt-2.5 border-t border-[#E6DCC8]/50 flex items-start gap-1.5 text-[11px] text-[#78716C]">
          <Info className="w-3.5 h-3.5 text-[#E2704A] shrink-0 mt-0.5" />
          <span>{pedagogicalNote}</span>
        </div>
      )}
    </div>
  );
};
