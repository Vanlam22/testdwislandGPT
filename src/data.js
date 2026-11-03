export const HR_HOME = 'https://sites.google.com/denwell.com/humanresorce/認識典華幸福機構';

// Only verified destination URLs should replace sourceUrl. Internal policy text is
// intentionally not inferred from topic names; the original HR site is authoritative.
export const islands = [
  { id: 'work', number: '01', name: '初心島', topic: '工作守則', subtitle: '從認識彼此，到一起做好每件事。', color: '#ba7781', ground: '#b7c7a0', position: [-10, -6], kind: 'book', tag: '認識我們',
    description: '每一份用心，都是典華的日常。從工作守則開始，認識我們共同的工作約定，找到與夥伴同行的節奏。',
    prompts: ['認識工作中的共同約定', '查閱工作守則與適用說明', '記下想向主管或人資確認的問題'], sourceUrl: HR_HOME },
  { id: 'safety', number: '02', name: '安心島', topic: '職場安全衛生', subtitle: '安心工作，是幸福的第一步。', color: '#7c9f89', ground: '#aec8b0', position: [-1, -10], kind: 'hospital', tag: '安心同行',
    description: '照顧自己，也照顧身邊的夥伴。一起熟悉工作環境中的安全資訊，讓每一天都能安心開始、平安結束。',
    prompts: ['查閱職場安全與衛生規範', '認識所在場域的緊急應變資訊', '確認遇到安全問題時的通報方式'], sourceUrl: HR_HOME },
  { id: 'benefits', number: '03', name: '幸福島', topic: '薪資福利與獎懲', subtitle: '看見付出，也認識屬於你的幸福。', color: '#bd965b', ground: '#d3c9a6', position: [9, -7], kind: 'gift', tag: '幸福日常',
    description: '你關心的薪資、福利與獎懲資訊，都從這裡開始探索。了解相關制度，也讓每一份努力都有清楚的方向。',
    prompts: ['查閱薪資制度的正式說明', '認識福利項目與適用條件', '了解獎懲制度及諮詢管道'], sourceUrl: HR_HOME },
  { id: 'attendance', number: '04', name: '時光島', topic: '出勤守則', subtitle: '安排好日常，讓每一天從容啟程。', color: '#8b8daf', ground: '#bfc5b1', position: [-12, 3], kind: 'clock', tag: '日常節奏',
    description: '從出勤紀錄到休假安排，認識日常工作裡的重要時間約定。讓你與團隊的每一次合作，都更有默契。',
    prompts: ['閱讀出勤與紀錄相關規範', '確認請假或異常處理的正式流程', '了解出勤問題的洽詢方式'], sourceUrl: HR_HOME },
  { id: 'repair', number: '05', name: '巧手島', topic: '報修申請', subtitle: '一起維護，讓工作的地方更美好。', color: '#bc875e', ground: '#c5c79e', position: [12, 2], kind: 'workshop', tag: '工作支援',
    description: '工作環境需要大家一起照顧。遇到設備或空間問題時，從正式報修入口找到合適的處理方式。',
    prompts: ['找到正式的報修申請入口', '依表單要求準備問題與位置資訊', '確認案件追蹤或聯絡窗口'], sourceUrl: HR_HOME },
  { id: 'hr', number: '06', name: '夥伴島', topic: '人事事務申請', subtitle: '每個重要時刻，都有夥伴陪著你。', color: '#b87987', ground: '#bdc3a2', position: [-8, 11], kind: 'house', tag: '夥伴服務',
    description: '需要辦理人事相關事項時，讓資訊更好找。從申請入口認識所需資料與流程，為下一步做好準備。',
    prompts: ['查看人事事務的申請分類', '依正式說明確認所需文件', '確認送件方式及負責窗口'], sourceUrl: HR_HOME },
  { id: 'forms', number: '07', name: '寶藏島', topic: '表單下載', subtitle: '需要的工具，替你收在這裡。', color: '#859eab', ground: '#b5c8b5', position: [1, 13], kind: 'library', tag: '實用工具',
    description: '把找資料的時間，留給更重要的事。前往同仁網站，依照你的需求尋找正式表單與填寫說明。',
    prompts: ['找到這次需要使用的表單', '確認檔案版本與填寫說明', '閱讀表單的提交方式'], sourceUrl: HR_HOME },
  { id: 'email', number: '08', name: '連心島', topic: '公務信箱簽名檔', subtitle: '讓每一次聯繫，都傳遞典華的溫度。', color: '#9c87a4', ground: '#c4c2ad', position: [10, 10], kind: 'mail', tag: '品牌日常',
    description: '一封信，也能傳遞專業與溫度。認識公務信箱簽名檔的正式格式，讓對外聯繫有一致而清楚的樣貌。',
    prompts: ['查閱最新的簽名檔範本', '依正式格式確認個人聯絡資訊', '參考原始頁面的設定步驟'], sourceUrl: HR_HOME },
];

export const defaultProfile = { name: '典華探索家', skin: '#e6b99b', hair: '#45342f', outfit: '#893d50', hairstyle: 'short' };
export const skinColors = ['#f2cfb1', '#e6b99b', '#c68f6b', '#8c5e45'];
export const hairColors = ['#45342f', '#7b5942', '#bd9563', '#d1c4b5'];
export const outfitColors = ['#893d50', '#c49d60', '#6b8c80', '#7888a3', '#a18aaf', '#e4d8c3'];

export function readSaved() {
  try {
    const data = JSON.parse(localStorage.getItem('denwell-island-v1') || '{}');
    const p = data.profile || {};
    return {
      profile: { name: typeof p.name === 'string' && p.name.trim() ? p.name.slice(0, 16) : defaultProfile.name,
        skin: skinColors.includes(p.skin) ? p.skin : defaultProfile.skin,
        hair: hairColors.includes(p.hair) ? p.hair : defaultProfile.hair,
        outfit: outfitColors.includes(p.outfit) ? p.outfit : defaultProfile.outfit,
        hairstyle: ['short', 'long', 'bun'].includes(p.hairstyle) ? p.hairstyle : defaultProfile.hairstyle },
      completed: Array.isArray(data.completed) ? [...new Set(data.completed.filter(id => islands.some(i => i.id === id)))] : [],
    };
  } catch { return { profile: { ...defaultProfile }, completed: [] }; }
}
