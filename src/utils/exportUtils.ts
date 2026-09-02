import { toPng } from 'html-to-image';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { GameEvent, Team, GameSettings } from '../types';
import { isCapacitorNative } from './capacitorUtils';

export interface ExportResult {
  success: boolean;
  method: 'capacitor_share' | 'web_share' | 'browser_download' | 'preview_fallback';
  dataUrl?: string;
  error?: string;
}

/**
 * Converts a base64 Data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Universal file saver/exporter supporting Desktop Web, Mobile Browser WebShare, and Native App (Capacitor)
 */
export async function universalSaveFile(
  filename: string,
  content: string | Blob,
  mimeType: string,
  title = '导出比赛数据'
): Promise<ExportResult> {
  // 1. Native Capacitor Environment (Android / iOS)
  if (isCapacitorNative()) {
    try {
      let writeData: string;
      let isBase64 = false;

      if (content instanceof Blob) {
        // Convert Blob to Base64 string for Capacitor Filesystem
        writeData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result as string;
            const base64 = res.split(',')[1] || '';
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(content);
        });
        isBase64 = true;
      } else {
        writeData = content;
      }

      const fileResult = await Filesystem.writeFile({
        path: filename,
        data: writeData,
        directory: Directory.Cache,
        encoding: isBase64 ? undefined : Encoding.UTF8,
      });

      // Invoke Native System Share dialog to save to files, send to WeChat/QQ, drive, etc.
      await Share.share({
        title,
        text: `${title} - ${filename}`,
        files: [fileResult.uri],
        dialogTitle: `分享或保存文件：${filename}`,
      });

      return { success: true, method: 'capacitor_share' };
    } catch (err: any) {
      console.warn('Native Capacitor export error, falling back to web methods:', err);
    }
  }

  // 2. Mobile Browser Web Share API (if supported for files)
  try {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: mimeType });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
        });
        return { success: true, method: 'web_share' };
      }
    }
  } catch (shareErr) {
    // User cancelled share or share failed; proceed to normal download
    console.warn('Web Share API aborted or failed:', shareErr);
  }

  // 3. Desktop / Standard Browser Blob Download
  try {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { success: true, method: 'browser_download' };
  } catch (err: any) {
    console.error('Browser download failed:', err);
    return { success: false, method: 'browser_download', error: err?.message || '下载失败' };
  }
}

/**
 * Downloads a string payload as a local file with the specified MIME type
 */
export function downloadFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8') {
  return universalSaveFile(filename, content, mimeType);
}

/**
 * Exports match play-by-play events as CSV (Excel compatible with UTF-8 BOM)
 */
export async function exportPlayByPlayCSV(
  events: GameEvent[],
  homeTeam: Team,
  awayTeam: Team,
  period: number,
  totalRegularPeriods: number
): Promise<ExportResult> {
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
  return universalSaveFile(filename, csvContent, 'text/csv;charset=utf-8', '比赛技术流水CSV');
}

/**
 * Exports match play-by-play events as formatted Text / Markdown
 */
export async function exportPlayByPlayText(
  events: GameEvent[],
  homeTeam: Team,
  awayTeam: Team,
  period: number,
  totalRegularPeriods: number
): Promise<ExportResult> {
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
  return universalSaveFile(filename, lines.join('\n'), 'text/plain;charset=utf-8', '比赛详细进程战报');
}

/**
 * Exports complete game state as structured JSON
 */
export async function exportGameDataJSON(
  events: GameEvent[],
  homeTeam: Team,
  awayTeam: Team,
  period: number,
  settings: GameSettings
): Promise<ExportResult> {
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
  return universalSaveFile(filename, JSON.stringify(data, null, 2), 'application/json;charset=utf-8', '比赛完整JSON数据');
}

/**
 * Captures a specific DOM node and exports as high-resolution PNG image
 */
export async function exportElementAsPNG(
  element: HTMLElement,
  filename: string
): Promise<ExportResult> {
  const cleanFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2, // High clarity, well balanced for mobile memory
      quality: 0.98,
      backgroundColor: '#090d16',
      style: {
        borderRadius: '0px',
      },
    });

    const blob = dataUrlToBlob(dataUrl);

    // 1. Native Capacitor Environment
    if (isCapacitorNative()) {
      try {
        const base64Data = dataUrl.split(',')[1] || '';
        const fileResult = await Filesystem.writeFile({
          path: cleanFilename,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: '比赛战报海报',
          text: `篮球比赛战报海报 - ${cleanFilename}`,
          files: [fileResult.uri],
          dialogTitle: '保存或分享战报图片',
        });

        return { success: true, method: 'capacitor_share', dataUrl };
      } catch (nativeErr) {
        console.warn('Native Capacitor share failed, falling back:', nativeErr);
      }
    }

    // 2. Mobile Browser Web Share API
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], cleanFilename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: '篮球比赛战报海报',
          });
          return { success: true, method: 'web_share', dataUrl };
        }
      } catch (shareErr) {
        console.warn('Web Share failed or cancelled:', shareErr);
      }
    }

    // 3. Desktop / Standard Web Download
    try {
      const link = document.createElement('a');
      link.download = cleanFilename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, method: 'browser_download', dataUrl };
    } catch (downloadErr) {
      console.warn('Standard link download failed:', downloadErr);
      return { success: true, method: 'preview_fallback', dataUrl };
    }
  } catch (err: any) {
    console.error('Failed to export element as PNG image', err);
    return { success: false, method: 'preview_fallback', error: err?.message || '生成图片失败' };
  }
}
