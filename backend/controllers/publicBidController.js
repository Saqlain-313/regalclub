const mongoose = require("mongoose");
const Bid = require("../models/Bid");
const Market = require("../models/Market");

exports.getPublicBidResults = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      marketId, 
      gameType, 
      status = 'won',
      search 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};
    
    if (marketId && marketId !== 'all') {
      filter.marketId = new mongoose.Types.ObjectId(marketId);
    }
    
    if (gameType && gameType !== 'all') {
      filter.gameType = gameType;
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Search by transaction ID or number
    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { number: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const totalCount = await Bid.countDocuments(filter);

    // Get bid results with populated fields
    const results = await Bid.find(filter)
      .populate('userId', 'username email')
      .populate('marketId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get statistics
    const stats = await Bid.aggregate([
      {
        $match: { status: 'won' }
      },
      {
        $group: {
          _id: null,
          totalWonAmount: { $sum: '$winAmount' },
          totalWins: { $sum: 1 },
          totalBidAmount: { $sum: '$bidAmount' }
        }
      }
    ]);

    // Get recent 10 winning numbers
    const recentWins = await Bid.find({ status: 'won' })
      .populate('marketId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get unique markets for filter
    const markets = await Bid.distinct('marketId', { status: 'won' });
    const marketDetails = await Market.find({ 
      _id: { $in: markets } 
    }).select('name _id');

    // Group by game type
    const gameTypeStats = await Bid.aggregate([
      {
        $match: { status: 'won' }
      },
      {
        $group: {
          _id: '$gameType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$winAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        results,
        recentWins,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        },
        stats: {
          totalWonAmount: stats[0]?.totalWonAmount || 0,
          totalWins: stats[0]?.totalWins || 0,
          totalBidAmount: stats[0]?.totalBidAmount || 0
        },
        gameTypeStats,
        markets: marketDetails
      }
    });

  } catch (error) {
    console.error('Error fetching public bid results:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bid results',
      error: error.message
    });
  }
};