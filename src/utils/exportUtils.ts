import * as XLSX from 'xlsx';

/**
 * Xuất dữ liệu bảng sang file Excel (.xlsx) chuẩn
 * Không xuất mật khẩu hoặc thông tin nhạy cảm
 */
export function exportToExcel(
  data: any[],
  fileName: string = 'mam_van_bao_cao',
  sheetName: string = 'Số liệu'
): void {
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất file Excel.');
    return;
  }

  // Làm sạch dữ liệu, loại bỏ thông tin nhạy cảm
  const sanitized = data.map((item) => {
    const copy = { ...item };
    delete copy.password_hash;
    delete copy.token;
    delete copy.id;
    return copy;
  });

  const worksheet = XLSX.utils.json_to_sheet(sanitized);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const cleanFileName = `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, cleanFileName);
}

/**
 * Xuất dữ liệu bảng sang file CSV (.csv) hỗ trợ tiếng Việt UTF-8 BOM
 */
export function exportToCsv(data: any[], fileName: string = 'mam_van_du_lieu'): void {
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất file CSV.');
    return;
  }

  const sanitized = data.map((item) => {
    const copy = { ...item };
    delete copy.password_hash;
    delete copy.token;
    delete copy.id;
    return copy;
  });

  const worksheet = XLSX.utils.json_to_sheet(sanitized);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  // Thêm BOM UTF-8 để Excel hiển thị tiếng Việt không bị lỗi font
  const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * In báo cáo hoặc lưu dạng PDF
 */
export function printReport(): void {
  window.print();
}
