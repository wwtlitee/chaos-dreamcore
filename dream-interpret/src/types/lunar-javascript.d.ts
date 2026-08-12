declare module "lunar-javascript" {
  interface EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearWuXing(): string;
    getMonthWuXing(): string;
    getDayWuXing(): string;
    getTimeWuXing(): string;
    getDayGan(): string;
  }

  interface Lunar {
    getYearZhi(): string;
    getMonth(): number;
    getDay(): number;
    getEightChar(): EightChar;
  }

  export const Solar: {
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): {
      getLunar(): Lunar;
    };
  };
}
