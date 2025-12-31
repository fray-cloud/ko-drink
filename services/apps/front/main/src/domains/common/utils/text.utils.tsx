import React from 'react';
import { ReferenceBadge } from '../components/ReferenceBadge';

// 텍스트에서 검색어를 볼드 처리하는 함수
export function highlightText(
  text: string,
  searchText: string,
): React.ReactElement[] {
  if (!searchText || !text) {
    return [<span key="text">{text}</span>];
  }

  const regex = new RegExp(
    `(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi',
  );
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === searchText.toLowerCase()) {
      return (
        <strong key={index} className="font-bold text-gray-900 dark:text-white">
          {part}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

// 텍스트에서 "XX:《XXXX》" 패턴을 찾아 뱃지로 변환하는 함수
export function parseDescriptionWithBadges(
  text: string,
  searchText?: string,
  title?: string,
  enableSeries?: boolean, // 시리즈 패턴 파싱 활성화 여부
): React.ReactElement[] {
  if (!text) {
    return [];
  }

  let processedText = text;

  // 1. 설명 맨 앞에 제목과 중복된 내용 삭제
  if (title) {
    const titlePattern = new RegExp(
      `^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`,
      'i',
    );
    processedText = processedText.replace(titlePattern, '');
  }

  // 2. "⇐〚...〛" 패턴을 "참고: ..." 뱃지로 변환
  const referencePattern = /⇐〚([^〛]+)〛/g;
  processedText = processedText.replace(referencePattern, (match, content) => {
    return `참고:《${content}》`;
  });

  // 3. "[단어] [숫자]" 또는 "[숫자]" 패턴에서 숫자를 "시리즈: [숫자]" 뱃지로 변환
  // 실제 데이터: "이화국 2 ⇐〚이화주〛" 또는 "2 소국을 쓰는 술" 형태
  // 패턴 1: 단어 + 공백 + 숫자 + 공백
  // 패턴 2: 숫자 + 공백 (숫자가 맨 앞에 오는 경우)
  // 숫자만 뱃지로 변환하고 단어는 유지
  // 먼저 시리즈 패턴을 찾아서 특별한 마커로 변환
  // enableSeries가 false이면 시리즈 패턴 파싱을 건너뜀
  const seriesMarkers: Array<{ marker: string; word: string; number: string }> =
    [];
  let markerIndex = 0;

  if (enableSeries !== false) {
    const seriesPattern = /(?:(\S+)\s+)?(\d+)\s+/g;
    processedText = processedText.replace(
      seriesPattern,
      (match, word, number) => {
        const marker = `__SERIES_${markerIndex}__`;
        seriesMarkers.push({ marker, word: word || '', number });
        markerIndex++;
        // word가 있으면 "word marker " 형태로, 없으면 "marker " 형태로
        return word ? `${word} ${marker} ` : `${marker} `;
      },
    );
  }

  // "XX:《XXXX》" 패턴을 찾는 정규식 (XX는 정확히 두 글자)
  const badgePattern = /(.{2}):(《[^》]+》)/g;
  const parts: Array<{
    type: 'text' | 'badge' | 'series';
    content?: string;
    left?: string;
    right?: string;
    seriesWord?: string;
    seriesNumber?: string;
  }> = [];

  let lastIndex = 0;
  let match;

  while ((match = badgePattern.exec(processedText)) !== null) {
    // 뱃지 이전의 텍스트
    if (match.index > lastIndex) {
      const beforeText = processedText.substring(lastIndex, match.index);
      // 시리즈 마커가 있는지 확인
      const seriesMarkerRegex = /__SERIES_(\d+)__/g;
      let seriesMarkerMatch;
      let textStart = 0;

      while (
        (seriesMarkerMatch = seriesMarkerRegex.exec(beforeText)) !== null
      ) {
        // 마커 이전의 텍스트
        if (seriesMarkerMatch.index > textStart) {
          parts.push({
            type: 'text',
            content: beforeText.substring(textStart, seriesMarkerMatch.index),
          });
        }

        // 시리즈 뱃지 추가
        const markerNum = parseInt(seriesMarkerMatch[1], 10);
        const seriesMarker = seriesMarkers[markerNum];
        if (seriesMarker) {
          // 단어는 텍스트로
          parts.push({
            type: 'text',
            content: seriesMarker.word + ' ',
          });
          // 숫자는 시리즈 뱃지로
          parts.push({
            type: 'series',
            seriesNumber: seriesMarker.number,
          });
        }

        textStart = seriesMarkerRegex.lastIndex;
      }

      // 마지막 마커 이후의 텍스트
      if (textStart < beforeText.length) {
        parts.push({
          type: 'text',
          content: beforeText.substring(textStart),
        });
      }
    }

    // 뱃지 부분
    parts.push({
      type: 'badge',
      left: match[1].trim(), // XX 부분
      right: match[2], // 《XXXX》 부분
      content: match[0], // 전체 매치
    });

    lastIndex = badgePattern.lastIndex;
  }

  // 마지막 뱃지 이후의 텍스트
  if (lastIndex < processedText.length) {
    const afterText = processedText.substring(lastIndex);
    // 시리즈 마커가 있는지 확인
    const seriesMarkerRegex = /__SERIES_(\d+)__/g;
    let seriesMarkerMatch;
    let textStart = 0;

    while ((seriesMarkerMatch = seriesMarkerRegex.exec(afterText)) !== null) {
      // 마커 이전의 텍스트
      if (seriesMarkerMatch.index > textStart) {
        parts.push({
          type: 'text',
          content: afterText.substring(textStart, seriesMarkerMatch.index),
        });
      }

      // 시리즈 뱃지 추가
      const markerNum = parseInt(seriesMarkerMatch[1], 10);
      const seriesMarker = seriesMarkers[markerNum];
      if (seriesMarker) {
        // 단어는 텍스트로
        parts.push({
          type: 'text',
          content: seriesMarker.word + ' ',
        });
        // 숫자는 시리즈 뱃지로
        parts.push({
          type: 'series',
          seriesNumber: seriesMarker.number,
        });
      }

      textStart = seriesMarkerRegex.lastIndex;
    }

    // 마지막 마커 이후의 텍스트
    if (textStart < afterText.length) {
      parts.push({
        type: 'text',
        content: afterText.substring(textStart),
      });
    }
  }

  // 매치가 없으면 원본 텍스트 반환 (시리즈 마커 확인 포함)
  if (parts.length === 0) {
    const seriesMarkerRegex = /__SERIES_(\d+)__/g;
    let seriesMarkerMatch;
    let textStart = 0;

    while (
      (seriesMarkerMatch = seriesMarkerRegex.exec(processedText)) !== null
    ) {
      // 마커 이전의 텍스트
      if (seriesMarkerMatch.index > textStart) {
        parts.push({
          type: 'text',
          content: processedText.substring(textStart, seriesMarkerMatch.index),
        });
      }

      // 시리즈 뱃지 추가
      const markerNum = parseInt(seriesMarkerMatch[1], 10);
      const seriesMarker = seriesMarkers[markerNum];
      if (seriesMarker) {
        // 단어는 텍스트로
        parts.push({
          type: 'text',
          content: seriesMarker.word + ' ',
        });
        // 숫자는 시리즈 뱃지로
        parts.push({
          type: 'series',
          seriesNumber: seriesMarker.number,
        });
      }

      textStart = seriesMarkerRegex.lastIndex;
    }

    // 마지막 마커 이후의 텍스트
    if (textStart < processedText.length) {
      parts.push({
        type: 'text',
        content: processedText.substring(textStart),
      });
    }

    // 마커가 없으면 원본 텍스트 반환
    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: processedText,
      });
    }
  }

  return parts.map((part, index) => {
    if (part.type === 'badge' && part.left && part.right) {
      return <ReferenceBadge key={index} left={part.left} right={part.right} />;
    } else if (part.type === 'series' && part.seriesNumber) {
      // 시리즈 뱃지만 표시 (단어는 이미 텍스트로 추가됨)
      return (
        <ReferenceBadge
          key={index}
          left="시리즈"
          right={`${part.seriesNumber}`}
        />
      );
    } else {
      // 텍스트 부분은 검색어 하이라이트 적용
      return (
        <span key={index}>
          {searchText && part.content
            ? highlightText(part.content, searchText)
            : part.content}
        </span>
      );
    }
  });
}
