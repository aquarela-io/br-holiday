import { staticHolidays } from "./data";

export type Holiday = {
  date: string;
  name: string;
  type: string;
};

interface HolidayHandler {
  getHolidays(year: number): Promise<Holiday[]>;
  isHoliday(date: string): Promise<boolean>;
}

export class BRHoliday implements HolidayHandler {
  private static staticData: Record<number, Holiday[]> | null = null;
  private liveOnly: boolean;

  constructor(options?: { liveOnly?: boolean }) {
    this.liveOnly = options?.liveOnly ?? false;
  }

  private async loadStaticData(): Promise<Record<number, Holiday[]> | null> {
    if (this.liveOnly) {
      return null;
    }

    if (BRHoliday.staticData !== null) {
      return BRHoliday.staticData;
    }

    try {
      BRHoliday.staticData = staticHolidays;
      return staticHolidays;
    } catch (error) {
      return null;
    }
  }

  async getHolidays(year: number): Promise<Holiday[]> {
    const staticData = await this.loadStaticData();
    if (staticData && staticData[year]) {
      return staticData[year];
    }

    const holidays = await fetch(
      `https://brasilapi.com.br/api/feriados/v1/${year}`
    );
    const data = await holidays.json();
    return data;
  }

  async isHoliday(date: string): Promise<boolean> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    const year = parseInt(date.split("-")[0]);
    const holidays = await this.getHolidays(year);
    return holidays.some((holiday) => holiday.date === date);
  }
}
