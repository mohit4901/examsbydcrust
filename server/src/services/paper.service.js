import Paper from '../models/Paper.model.js';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

export const getPapers = async (filters = {}, page = 1, limit = 50) => {
  const cacheKey = `papers_${JSON.stringify(filters)}_${page}_${limit}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  const query = {};

  //  Text search
  if (filters.search && filters.search.trim() !== '') {
    const searchRegex = new RegExp(filters.search.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
    const cleanSearch = filters.search.trim().replace(/[^a-zA-Z0-9]/g, '');
    
    query.$or = [
      { subject_name: { $regex: searchRegex } },
      { subject_code: { $regex: searchRegex } },
      { subject_code: { $regex: new RegExp(cleanSearch, 'i') } }
    ];
  }

  // Branch
  if (filters.branch && filters.branch !== 'ALL') {
    // Handle both single branch and multiple branches (if needed later)
    query.branch = filters.branch.toUpperCase();
  }

  // Semester
  if (filters.semester !== undefined && filters.semester !== null) {
    query.semester = parseInt(filters.semester);
  }

  // Year
  if (filters.year !== undefined && filters.year !== null) {
    query.year = parseInt(filters.year);
  }

  // Session
  if (filters.session && filters.session !== 'ALL') {
    query.session = filters.session;
  }

  const skip = (page - 1) * limit;

  const [papers, total] = await Promise.all([
    Paper.find(query)
      .sort({ year: -1, session: 1, subject_code: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Paper.countDocuments(query)
  ]);

  const result = {
    papers,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  };

  cache.set(cacheKey, result);
  return result;
};

export const getPersonalizedPapers = async (user) => {
  const { branch, semester } = user;
  
  const cacheKey = `personalized_${branch}_${semester}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  // More flexible branch matching: Split "B.Tech CSE" into keywords
  const branchKeywords = branch.split(/[\s.]+/)
    .filter(k => k.length > 1 && !['BTECH', 'MTECH', 'B', 'M', 'PHD', 'BACHELOR', 'MASTER'].includes(k.toUpperCase()));
  
  const branchQueries = [
    { branch: branch.toUpperCase() },
    { branch: { $regex: new RegExp(branch, 'i') } }
  ];

  branchKeywords.forEach(keyword => {
    branchQueries.push({ branch: { $regex: new RegExp(keyword, 'i') } });
    branchQueries.push({ subject_name: { $regex: new RegExp(keyword, 'i') } });
  });
  
  const papers = await Paper.find({
    $or: branchQueries,
    semester: parseInt(semester)
  })
  .sort({ year: -1, subject_name: 1 })
  .limit(60) 
  .lean();

  // Also fetch common papers (like HUM101C if the user is in 1st/2nd sem)
  // This is a bit more complex, but for now we'll stick to direct match
  
  cache.set(cacheKey, papers);
  return papers;
};

export const getAvailableFilters = async () => {
  const cacheKey = 'filters';
  const cachedFilters = cache.get(cacheKey);

  if (cachedFilters) {
    return cachedFilters;
  }

  const [branches, semesters, years, sessions] = await Promise.all([
    Paper.distinct('branch'),
    Paper.distinct('semester'),
    Paper.distinct('year'),
    Paper.distinct('session')
  ]);

  const result = {
    branches: branches.sort(),
    semesters: semesters.filter(Boolean).sort(),
    years: years.sort((a, b) => b - a),
    sessions: sessions.sort()
  };

  cache.set(cacheKey, result);
  return result;
};

export const getStats = async () => {
  const total = await Paper.countDocuments();

  const byBranch = await Paper.aggregate([
    { $group: { _id: '$branch', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const bySemester = await Paper.aggregate([
    { $match: { semester: { $ne: null } } },
    { $group: { _id: '$semester', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  return {
    total,
    byBranch: byBranch.map(b => ({ branch: b._id, count: b.count })),
    bySemester: bySemester.map(s => ({ semester: s._id, count: s.count }))
  };
};
