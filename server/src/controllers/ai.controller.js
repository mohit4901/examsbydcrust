import * as aiService from '../services/ai.service.js';
import * as paperService from '../services/paper.service.js';

export const getAIInsights = async (req, res) => {
  try {
    const user = req.user;
    const papers = await paperService.getPersonalizedPapers(user);
    
    const insights = await aiService.getStudyRecommendations(user, papers);
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error in getAIInsights:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const chat = async (req, res) => {
  try {
    const { message, context } = req.body;
    const response = await aiService.chatWithAI(message, context);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error in AI Chat:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getDeepAnalysis = async (req, res) => {
  try {
    const { subjectCode } = req.params;
    // Fetch all papers for this subject code to give AI more context
    const papersResult = await paperService.getPapers({ search: subjectCode }, 1, 10);
    const papers = papersResult.papers;
    
    const analysis = await aiService.getDeepAnalysis(subjectCode, papers);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error in getDeepAnalysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
