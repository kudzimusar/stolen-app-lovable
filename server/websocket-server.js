#!/usr/bin/env node

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5178", "http://127.0.0.1:5178", "http://192.168.40.187:5178"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());

// Store active connections and deal rooms
const dealRooms = new Map();
const userConnections = new Map();
const activeBids = new Map();
const dealTimers = new Map();

console.log('🚀 Hot Deals WebSocket Server Starting...');

// Hot Deals real-time functionality
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  // Join a specific deal room
  socket.on('join_deal', ({ dealId }) => {
    socket.join(`deal_${dealId}`);
    
    if (!dealRooms.has(dealId)) {
      dealRooms.set(dealId, new Set());
    }
    dealRooms.get(dealId).add(socket.id);
    
    console.log(`👥 User ${socket.id} joined deal ${dealId}`);
    
    // Send current deal status
    socket.emit('deal_status', {
      dealId,
      viewers: dealRooms.get(dealId).size,
      activeBids: activeBids.get(dealId) || [],
      timestamp: new Date().toISOString()
    });
    
    // Notify others in the room
    socket.to(`deal_${dealId}`).emit('user_joined', {
      dealId,
      totalViewers: dealRooms.get(dealId).size
    });
  });

  // Leave a deal room
  socket.on('leave_deal', ({ dealId }) => {
    socket.leave(`deal_${dealId}`);
    
    if (dealRooms.has(dealId)) {
      dealRooms.get(dealId).delete(socket.id);
      
      // Clean up empty rooms
      if (dealRooms.get(dealId).size === 0) {
        dealRooms.delete(dealId);
      }
    }
    
    console.log(`👋 User ${socket.id} left deal ${dealId}`);
  });

  // Handle bid placement
  socket.on('place_bid', ({ dealId, bidAmount, bidderInfo, timestamp }) => {
    console.log(`💰 New bid on deal ${dealId}: R${bidAmount} by ${bidderInfo.userName}`);
    
    // Store bid
    if (!activeBids.has(dealId)) {
      activeBids.set(dealId, []);
    }
    
    const bid = {
      id: `${dealId}_${Date.now()}`,
      dealId,
      bidAmount,
      bidder: bidderInfo.userName,
      bidderId: bidderInfo.userId,
      timestamp: new Date(timestamp),
      isWinning: true // This would be calculated based on other bids
    };
    
    // Add bid and sort by amount (highest first)
    const dealBids = activeBids.get(dealId);
    dealBids.push(bid);
    dealBids.sort((a, b) => b.bidAmount - a.bidAmount);
    
    // Update winning status
    dealBids.forEach((b, index) => {
      b.isWinning = index === 0;
    });
    
    // Broadcast bid update to all users in the deal room
    io.to(`deal_${dealId}`).emit('bid_placed', {
      dealId,
      bidAmount,
      bidder: bidderInfo.userName,
      timestamp: new Date(timestamp),
      isWinning: bid.isWinning,
      totalBids: dealBids.length
    });
    
    // Send outbid notifications
    if (dealBids.length > 1) {
      const previousWinner = dealBids[1];
      socket.to(`deal_${dealId}`).emit('notification', {
        id: `outbid_${Date.now()}`,
        dealId,
        type: 'outbid',
        title: 'You\'ve been outbid!',
        message: `Someone bid R${bidAmount.toLocaleString()} on this item`,
        priority: 8,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle chat messages
  socket.on('chat_message', ({ dealId, message, senderInfo, timestamp }) => {
    console.log(`💬 Chat message in deal ${dealId}: ${message}`);
    
    // Broadcast message to deal room
    io.to(`deal_${dealId}`).emit('chat_message', {
      id: `msg_${Date.now()}`,
      dealId,
      sender: senderInfo.userName,
      message,
      timestamp: new Date(timestamp),
      type: 'user'
    });
    
    // Simulate AI assistant response (20% chance)
    if (Math.random() < 0.2) {
      setTimeout(() => {
        const aiResponses = [
          "💡 AI Tip: This item is priced 15% below market average!",
          "🔍 Similar items sold for R" + (Math.random() * 5000 + 10000).toFixed(0) + " this week",
          "⚡ This deal ends in less than 2 hours - don't miss out!",
          "🛡️ Verified seller with 98% positive feedback",
          "📊 Price has dropped 20% in the last hour!"
        ];
        
        io.to(`deal_${dealId}`).emit('chat_message', {
          id: `ai_${Date.now()}`,
          dealId,
          sender: 'AI Assistant',
          message: aiResponses[Math.floor(Math.random() * aiResponses.length)],
          timestamp: new Date().toISOString(),
          type: 'ai-assistant'
        });
      }, 2000);
    }
  });

  // Handle user presence updates
  socket.on('user_presence', ({ dealId, action, timestamp }) => {
    console.log(`👀 User presence in deal ${dealId}: ${action}`);
    
    socket.to(`deal_${dealId}`).emit('user_presence_update', {
      dealId,
      action,
      userId: socket.id,
      timestamp: new Date(timestamp),
      totalViewers: dealRooms.get(dealId)?.size || 0
    });
  });

  // Handle price update triggers
  socket.on('trigger_price_update', ({ dealId }) => {
    console.log(`💲 Price update triggered for deal ${dealId}`);
    
    // Simulate AI price optimization
    setTimeout(() => {
      const priceChange = (Math.random() - 0.5) * 1000; // Random price change ±R500
      const newPrice = Math.max(1000, 15999 + priceChange);
      const oldPrice = 15999;
      
      io.to(`deal_${dealId}`).emit('price_changed', {
        dealId,
        oldPrice,
        newPrice,
        changePercentage: ((newPrice - oldPrice) / oldPrice) * 100,
        reason: 'ai_optimization',
        timestamp: new Date().toISOString()
      });
      
      // Send notification if price dropped
      if (newPrice < oldPrice) {
        io.to(`deal_${dealId}`).emit('notification', {
          id: `price_drop_${Date.now()}`,
          dealId,
          type: 'price_drop',
          title: 'Price Drop Alert! 🔥',
          message: `Price dropped from R${oldPrice.toLocaleString()} to R${newPrice.toLocaleString()}`,
          priority: 7,
          timestamp: new Date().toISOString()
        });
      }
    }, 1000);
  });

  // Handle AI analysis requests
  socket.on('request_ai_analysis', ({ dealId }) => {
    console.log(`🤖 AI analysis requested for deal ${dealId}`);
    
    // Simulate AI analysis
    setTimeout(() => {
      const analysis = {
        dealId,
        demandPrediction: Math.floor(Math.random() * 100),
        priceRecommendation: 'maintain',
        fraudRisk: Math.floor(Math.random() * 20),
        timeOptimal: true,
        expectedSaleTime: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000),
        confidence: 75 + Math.floor(Math.random() * 25)
      };
      
      socket.emit('ai_analysis_complete', analysis);
    }, 2000);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
    
    // Clean up user from all deal rooms
    dealRooms.forEach((users, dealId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        
        // Notify remaining users
        socket.to(`deal_${dealId}`).emit('user_left', {
          dealId,
          totalViewers: users.size
        });
        
        // Clean up empty rooms
        if (users.size === 0) {
          dealRooms.delete(dealId);
        }
      }
    });
    
    userConnections.delete(socket.id);
  });

  // Store user connection
  userConnections.set(socket.id, {
    connectedAt: new Date(),
    lastActivity: new Date()
  });
});

// Countdown timer simulation for active deals
function startDealCountdowns() {
  const mockDeals = [
    { id: 'deal-1', endTime: new Date(Date.now() + 2 * 60 * 60 * 1000) }, // 2 hours
    { id: 'deal-2', endTime: new Date(Date.now() + 6 * 60 * 60 * 1000) }, // 6 hours
    { id: 'deal-3', endTime: new Date(Date.now() + 45 * 60 * 1000) }      // 45 minutes
  ];
  
  mockDeals.forEach(deal => {
    const updateInterval = setInterval(() => {
      const now = new Date();
      const timeLeft = Math.max(0, Math.floor((deal.endTime.getTime() - now.getTime()) / 1000));
      
      let urgencyLevel = 'low';
      let status = 'active';
      
      if (timeLeft === 0) {
        status = 'expired';
        urgencyLevel = 'critical';
        clearInterval(updateInterval);
        dealTimers.delete(deal.id);
        
        // Broadcast deal expiry
        io.to(`deal_${deal.id}`).emit('deal_expired', {
          dealId: deal.id,
          message: 'This deal has ended'
        });
      } else if (timeLeft < 300) { // 5 minutes
        urgencyLevel = 'critical';
        status = 'ending_soon';
      } else if (timeLeft < 1800) { // 30 minutes
        urgencyLevel = 'high';
      } else if (timeLeft < 3600) { // 1 hour
        urgencyLevel = 'medium';
      }
      
      // Broadcast time update
      io.to(`deal_${deal.id}`).emit('time_update', {
        dealId: deal.id,
        endTime: deal.endTime,
        timeLeft,
        status,
        urgencyLevel
      });
      
      // Send urgent notifications
      if (timeLeft === 300) { // 5 minutes warning
        io.to(`deal_${deal.id}`).emit('notification', {
          id: `urgent_${Date.now()}`,
          dealId: deal.id,
          type: 'time_running_out',
          title: 'Only 5 minutes left! ⏰',
          message: 'This deal ends in 5 minutes - don\'t miss out!',
          priority: 9,
          timestamp: new Date().toISOString()
        });
      }
    }, 1000);
    
    dealTimers.set(deal.id, updateInterval);
  });
}

// Flash sale simulation
function simulateFlashSales() {
  setInterval(() => {
    // Simulate new flash sale
    const saleId = `flash_${Date.now()}`;
    const flashSale = {
      id: saleId,
      name: 'Lightning Tech Flash Sale',
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      discountPercentage: 30 + Math.floor(Math.random() * 40),
      itemCount: 50 + Math.floor(Math.random() * 100)
    };
    
    // Broadcast to all connected users
    io.emit('flash_sale_started', flashSale);
    
    console.log(`⚡ Flash sale started: ${flashSale.name}`);
  }, 10 * 60 * 1000); // Every 10 minutes for demo
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connections: userConnections.size,
    activeDeals: dealRooms.size,
    activeBids: activeBids.size
  });
});

// API endpoint for deal updates (fallback for non-WebSocket clients)
app.post('/api/hot-deals/updates', (req, res) => {
  const { lastUpdate } = req.body;
  
  // Return mock updates since lastUpdate
  const updates = [
    {
      type: 'deal_updated',
      dealId: 'deal-1',
      data: { price: 15999, views: 350 },
      timestamp: Date.now()
    }
  ];
  
  res.json(updates);
});

// Start the server
const PORT = process.env.WEBSOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎯 Hot Deals WebSocket Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: http://localhost:5178, http://127.0.0.1:5178`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
  
  // Start simulations
  startDealCountdowns();
  simulateFlashSales();
  
  console.log('✅ Hot Deals real-time features are now active!');
});
