export function normalizeSubjectCode(code) {
    return code.trim().toUpperCase();
  }
  
  export function normalizeSubjectName(name) {
    return name.trim();
  }
  
  export function normalizeSession(session) {
    const s = session.toLowerCase();
    if (s.includes('dec') || s.includes('winter')) return 'Dec';
    if (s.includes('may') || s.includes('summer')) return 'May';
    if (s.includes('jun')) return 'June';
    return session;
  }