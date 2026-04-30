import * as paperService from '../services/paper.service.js';

export const getPapers = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      branch: req.query.branch,
      semester: req.query.semester ? parseInt(req.query.semester) : undefined,
      year: req.query.year ? parseInt(req.query.year) : undefined,
      session: req.query.session
    };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await paperService.getPapers(filters, page, limit);

    res.json({
      success: true,
      data: result.papers,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      }
    });
  } catch (error) {
    console.error('Error in getPapers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch papers'
    });
  }
};

export const getFilters = async (req, res) => {
  try {
    const filters = await paperService.getAvailableFilters();
    res.json({
      success: true,
      data: filters
    });
  } catch (error) {
    console.error('Error in getFilters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch filters'
    });
  }
};

export const getStats = async (req, res) => {
  try {
    const stats = await paperService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in getStats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
};