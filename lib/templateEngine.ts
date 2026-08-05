/**
 * Template Engine Utility
 * Mematuhi prinsip Metadata-Driven, DRY, dan SoC
 */

export interface TemplateVariables {
  [key: string]: string | number | undefined | null;
}

export class TemplateEngine {
  /**
   * Menggantikan placeholder {KEY} dengan nilai dari dictionary variables
   */
  public static render(template: string, variables: TemplateVariables): string {
    if (!template) return '';
    return template.replace(/\{([A-Z0-9_]+)\}/g, (match, key) => {
      const val = variables[key];
      return val !== undefined && val !== null ? String(val) : match;
    });
  }

  /**
   * Helper format mata uang Rupiah
   */
  public static formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Helper format tanggal Indonesia
   */
  public static formatIndonesianDate(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
}
