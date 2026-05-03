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
