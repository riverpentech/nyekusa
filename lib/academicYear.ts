export const ACADEMIC_YEAR_START_MONTH = 7; // 0-indexed: 7 = August

export function getCurrentTermStartYear(date: Date = new Date()): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    return month >= ACADEMIC_YEAR_START_MONTH ? year : year - 1;
}

export function getCurrentTermYear(date: Date = new Date()): string {
    const startYear = getCurrentTermStartYear(date);
    return `${startYear}/${startYear + 1}`;
}

export function isCurrentTerm(termYear: string, date: Date = new Date()): boolean {
    return termYear === getCurrentTermYear(date);
}

export function getPastTermYears(startYear: number, date: Date = new Date()): string[] {
    const currentTermStartYear = getCurrentTermStartYear(date);
    const length = Math.max(0, currentTermStartYear - startYear);
    return Array.from({ length }, (_, i) => currentTermStartYear - 1 - i).map(
        (y) => `${y}/${y + 1}`
    );
}