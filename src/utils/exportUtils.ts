import { toPng } from 'html-to-image';
import { GameEvent, Team, GameSettings } from '../types';

/**
 * Downloads a string payload as a local file with the specified MIME type
 */
export function downloadFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports match play-by-play events as CSV (Excel compatible with UTF-8 BOM)
 */
export function exportPlayByPlayCSV(
  events: GameEvent[],
  homeTeam: Team,
  awayTeam: Team,
  period: number,
  totalRegularPeriods: number
) {
  const chronological = [...events].reverse();
  const BOM = '\uFEFF'; // Excel UTF-8 Byte Order Mark

  const headers = [
    '序号',
    '比赛节次',
    '比赛时钟',
    '归属球队',
    '事件类型',
    '球员号码',
    '球员姓名',
    '得分变动',
    '主队即时总分',
    '客队即时总分',
    '详细描述',
    '系统时间',
  ];

  let curHome = 0;
  let curAway = 0;

  const rows = chronological.map((ev, index) => {
    if (ev.type === 'score' && ev.points) {
      if (ev.teamId === 'home') curHome = Math.max(0, curHome + ev.points);
      if (ev.teamId === 'away') curAway = Math.max(0, curAway + ev.points);
    } else if (ev.homeScore !== undefined && ev.awayScore !== undefined) {
      curHome = ev.homeScore;
      curAway = ev.awayScore;
    }

    const teamName = ev.teamId === 'home' ? homeTeam.name : ev.teamId === 'away' ? awayTeam.name : '技术台/系统';
    const periodLabel = ev.period <= totalRegularPeriods ? `第${ev.period}节` : `加时OT${ev.period - totalRegularPeriods}`;
    const dateStr = new Date(ev.timestamp).toLocaleTimeString();

    return [
      index + 1,
      `"${periodLabel}"`,
      `"${ev.gameClockDisplay}"`,
      `"${teamName.replace(/"/g, '""')}"`,
      `"${ev.type}"`,
      ev.playerNumber !== undefined ? `#${ev.playerNumber}` : '',
      `"${(ev.playerName || '').replace(/"/g, '""')}"`,
      ev.points ? (ev.points > 0 ? `+${ev.points}` : `${ev.points}`) : '',
      curHome,
      curAway,
      `"${ev.description.replace(/"/g, '""')}"`,
      `"${dateStr}"`,
    ].join(',');
  });

  const csvContent = BOM + [headers.join(','), ...rows].join('\r\n');
  const filename = `篮球比赛进程流水_${homeTeam.shortName || homeTeam.name}_vs_${awayTeam.shortName || awayTeam.name}_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(filename, csvContent, 'text/csv;charset=utf-8');
}

/**
 * Exports match play-by-play events as formatted Text / Markdown
 */
export function exportPlayByPlayText(
  events: GameEvent[],
  homeTeam: Team,
  awayTeam: Team,
  period: number,
  totalRegularPeriods: number
) {
  const chronological = [...events].reverse();
  const dateStr = new Date().toLocaleString();

  const lines = [
    `═══════════════════════════════════════════════════`,
    `🏀 篮球比赛完整技术进程与流水战报 (Play-by-Play)`,
    `═══════════════════════════════════════════════════`,
    `对阵双方：【主队】${homeTeam.name} vs 【客队】${awayTeam.name}`,
    `终场比分：${homeTeam.name} ${homeTeam.score} : ${awayTeam.score} ${awayTeam.name}`,
    `记录时间：${dateStr}`,
    `总事件数：共 ${events.length} 条记录`,
    `───────────────────────────────────────────────────`,
    `【逐回合进程流水】`,
  ];

  let curHome = 0;
  let curAway = 0;

  chronological.forEach((ev, idx) => {
    if (ev.type === 'score' && ev.points) {
      if (ev.teamId === 'home') curHome = Math.max(0, curHome + ev.points);
      if (ev.teamId === 'away') curAway = Math.max(0, curAway + ev.points);
    } else if (ev.homeScore !== undefined && ev.awayScore !== undefined) {
      curHome = ev.homeScore;
      curAway = ev.awayScore;
    }

    const teamTag = ev.teamId === 'home' ? `[${homeTeam.name}]` : ev.teamId === 'away' ? `[${awayTeam.name}]` : '[技术台]';
    const periodLabel = ev.period <= totalRegularPeriods ? `Q${ev.period}` : `OT${ev.period - totalRegularPeriods}`;
    const scoreStr = `(比分 ${curHome}:${curAway})`;

    lines.push(
      `${String(idx + 1).padStart(3, ' ')}. [${periodLabel} ${ev.gameClockDisplay}] ${teamTag} ${ev.description} ${scoreStr}`
    );
  });

  lines.push(`═══════════════════════════════════════════════════`);
  const filename = `比赛详细进程_${homeTeam.shortName || homeTeam.name}_vs_${awayTeam.shortName || awayTeam.name}.txt`;
  downloadFile(filename, lines.join('\n'), 'text/plain;charset=utf-8');
}

/**
 * Exports complete game state as structured JSON
 */
export function exportGameDataJSON(
  events: GameEvent[],
  homeTeam: Team,
  awayTeam: Team,
  period: number,
  settings: GameSettings
) {
  const data = {
    exportDate: new Date().toISOString(),
    match: {
      homeTeam,
      awayTeam,
      period,
      settings,
      finalScore: {
        home: homeTeam.score,
        away: awayTeam.score,
      },
    },
    events,
  };

  const filename = `比赛完整数据_${homeTeam.shortName || homeTeam.name}_vs_${awayTeam.shortName || awayTeam.name}.json`;
  downloadFile(filename, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
}

/**
 * Captures a specific DOM node and downloads as high-resolution PNG image
 */
export async function exportElementAsPNG(element: HTMLElement, filename: string): Promise<boolean> {
  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2.5, // Crisp retina quality
      quality: 0.98,
      backgroundColor: '#090d16',
      style: {
        borderRadius: '0px',
      },
    });

    const link = document.createElement('a');
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Failed to export element as PNG image', err);
    return false;
  }
}
