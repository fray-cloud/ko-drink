import React from 'react';
import { ReferenceBadge } from '../components/ReferenceBadge';

// 텍스트에서 검색어를 볼드 처리하는 함수
export function highlightText(text: string, searchText: string): React.ReactElement[] {
  if (!searchText || !text) {
    return [<span key="text">{text}</span>];
  }

  const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
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
export function parseDescriptionWithBadges(text: string, searchText?: string): React.ReactElement[] {
  if (!text) {
    return [];
  }

  // "XX:《XXXX》" 패턴을 찾는 정규식 (XX는 정확히 두 글자)
  const badgePattern = /(.{2}):(《[^》]+》)/g;
  const parts: Array<{ type: 'text' | 'badge'; content: string; left?: string; right?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = badgePattern.exec(text)) !== null) {
    // 뱃지 이전의 텍스트
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
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
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  // 매치가 없으면 원본 텍스트 반환
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content: text,
    });
  }

  return parts.map((part, index) => {
    if (part.type === 'badge' && part.left && part.right) {
      return <ReferenceBadge key={index} left={part.left} right={part.right} />;
    } else {
      // 텍스트 부분은 검색어 하이라이트 적용
      return (
        <span key={index}>
          {searchText ? highlightText(part.content, searchText) : part.content}
        </span>
      );
    }
  });
}

