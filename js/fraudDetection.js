/**
 * Fraud Detection Module
 * 
 * This module provides functions to detect potential fraud patterns in gambling behavior
 * and returns analysis results with risk levels for analysts to review.
 */

// Define risk levels and thresholds
const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Color coding for risk levels
const RISK_COLORS = {
  low: '#81F495', // Green
  medium: '#FFD966', // Yellow
  high: '#F07D88', // Red
  critical: '#D01C1F' // Dark Red
};

/**
 * Main fraud detection function that analyzes player data and returns fraud analysis
 * @param {Object} playerData - Object containing player's betting data
 * @returns {Object} - Analysis results with risk level and explanation
 */
function detectFraudPatterns(playerData) {
  // Initialize results object
  const results = {
    riskLevel: RISK_LEVELS.LOW,
    riskScore: 0,
    detectedPatterns: [],
    explanation: '',
    color: RISK_COLORS.low
  };
  
  // Skip analysis if no data is provided
  if (!playerData || !playerData.rounds || playerData.rounds.length === 0) {
    results.explanation = 'Insufficient data for analysis';
    return results;
  }
  
  // Run all detection algorithms
  const detectionResults = [
    detectBettingPatterns(playerData),
    detectTimingAnomalies(playerData),
    detectMultipleAccounts(playerData),
    detectUnusualWinRates(playerData),
    detectSideBetManipulation(playerData),
    detectWinStreakAfterBreak(playerData),
    detectBreakHighWinPattern(playerData),
    detectLowRoundHighBet(playerData)
  ];
  
  // Combine all detection results
  let totalRiskScore = 0;
  detectionResults.forEach(result => {
    if (result.detected) {
      results.detectedPatterns.push(result.patternName);
      totalRiskScore += result.riskScore;
      
      // Add explanation with line break if not the first pattern
      if (results.explanation) {
        results.explanation += '<br>';
      }
      results.explanation += result.explanation;
    }
  });
  
  // Calculate final risk level based on total risk score
  results.riskScore = totalRiskScore;
  if (totalRiskScore >= 80) {
    results.riskLevel = RISK_LEVELS.CRITICAL;
    results.color = RISK_COLORS.critical;
  } else if (totalRiskScore >= 50) {
    results.riskLevel = RISK_LEVELS.HIGH;
    results.color = RISK_COLORS.high;
  } else if (totalRiskScore >= 25) {
    results.riskLevel = RISK_LEVELS.MEDIUM;
    results.color = RISK_COLORS.medium;
  } else {
    results.riskLevel = RISK_LEVELS.LOW;
    results.color = RISK_COLORS.low;
  }
  
  // If no patterns detected
  if (results.detectedPatterns.length === 0) {
    results.explanation = 'No fraud patterns detected';
  }
  
  return results;
}

/**
 * Detects suspicious betting patterns such as martingale strategy or unusual progression
 * @param {Object} playerData - Player betting data
 * @returns {Object} - Detection result
 */
function detectBettingPatterns(playerData) {
  const result = {
    patternName: 'Suspicious Betting Pattern',
    detected: false,
    riskScore: 0,
    explanation: ''
  };
  
  const rounds = playerData.rounds;
  let increasingBetCount = 0;
  let martingalePatternCount = 0;
  
  // Check for martingale betting pattern (doubling after losses)
  for (let i = 1; i < rounds.length; i++) {
    const previousRound = rounds[i-1];
    const currentRound = rounds[i];
    
    // Check for increasing bets after losses
    if (previousRound.netEUR < 0 && currentRound.betEUR >= previousRound.betEUR * 1.8) {
      martingalePatternCount++;
    }
    
    // Check for consistently increasing bets
    if (currentRound.betEUR > previousRound.betEUR * 1.5) {
      increasingBetCount++;
    }
  }
  
  // Calculate risk based on detected patterns
  const martingaleRatio = martingalePatternCount / (rounds.length - 1);
  const increasingBetRatio = increasingBetCount / (rounds.length - 1);
  
  if (martingaleRatio > 0.4) {
    result.detected = true;
    result.riskScore += 30;
    result.explanation = `Martingale betting pattern detected (${Math.round(martingaleRatio * 100)}% of rounds)`;
  }
  
  if (increasingBetRatio > 0.5) {
    result.detected = true;
    result.riskScore += 20;
    if (result.explanation) result.explanation += '<br>';
    result.explanation += `Unusual bet progression detected (${Math.round(increasingBetRatio * 100)}% increasing bets)`;
  }
  
  return result;
}

/**
 * Detects timing anomalies that might indicate automated play or collusion
 * @param {Object} playerData - Player betting data
 * @returns {Object} - Detection result
 */
function detectTimingAnomalies(playerData) {
  const result = {
    patternName: 'Timing Anomalies',
    detected: false,
    riskScore: 0,
    explanation: ''
  };
  
  const rounds = playerData.rounds;
  let consistentTimingCount = 0;
  let suspiciousBreaks = 0;
  
  // Check for suspiciously consistent timing between bets
  const timeDiffs = [];
  for (let i = 1; i < rounds.length; i++) {
    if (rounds[i].timestamp && rounds[i-1].timestamp) {
      const timeDiff = Math.abs(new Date(rounds[i].timestamp) - new Date(rounds[i-1].timestamp));
      timeDiffs.push(timeDiff);
      
      // Check for breaks that align with dealer shifts or surveillance patterns
      if (timeDiff > 30 * 60 * 1000 && timeDiff < 35 * 60 * 1000) { // 30-35 minute breaks
        suspiciousBreaks++;
      }
    }
  }
  
  // Calculate standard deviation of time differences
  if (timeDiffs.length > 5) {
    const mean = timeDiffs.reduce((sum, val) => sum + val, 0) / timeDiffs.length;
    const variance = timeDiffs.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / timeDiffs.length;
    const stdDev = Math.sqrt(variance);
    
    // If standard deviation is very low, timing is suspiciously consistent
    if (stdDev / mean < 0.1) {
      result.detected = true;
      result.riskScore += 25;
      result.explanation = 'Suspiciously consistent timing between bets detected';
    }
  }
  
  if (suspiciousBreaks >= 2) {
    result.detected = true;
    result.riskScore += 15;
    if (result.explanation) result.explanation += '<br>';
    result.explanation += `${suspiciousBreaks} suspicious breaks detected that align with dealer shifts`;
  }
  
  return result;
}

/**
 * Detects signs of multiple account usage or collusion
 * @param {Object} playerData - Player betting data
 * @returns {Object} - Detection result
 */
function detectMultipleAccounts(playerData) {
  const result = {
    patternName: 'Multiple Account Indicators',
    detected: false,
    riskScore: 0,
    explanation: ''
  };
  
  // Check for IP address or device sharing with other accounts
  if (playerData.sharedIPCount && playerData.sharedIPCount > 1) {
    result.detected = true;
    result.riskScore += 20;
    result.explanation = `Account shares IP address with ${playerData.sharedIPCount} other accounts`;
  }
  
  // Check for complementary betting patterns with other players
  if (playerData.complementaryBettingScore && playerData.complementaryBettingScore > 0.7) {
    result.detected = true;
    result.riskScore += 35;
    if (result.explanation) result.explanation += '<br>';
    result.explanation += 'Complementary betting patterns detected with other players';
  }
  
  return result;
}

/**
 * Detects statistically improbable win rates
 * @param {Object} playerData - Player betting data
 * @returns {Object} - Detection result
 */
function detectUnusualWinRates(playerData) {
  const result = {
    patternName: 'Unusual Win Rate',
    detected: false,
    riskScore: 0,
    explanation: ''
  };
  
  const rounds = playerData.rounds;
  let winCount = 0;
  let totalRounds = rounds.length;
  
  // Skip if not enough data
  if (totalRounds < 10) return result;
  
  // Count wins
  rounds.forEach(round => {
    if (round.netEUR > 0) winCount++;
  });
  
  const winRate = winCount / totalRounds;
  
  // Check for unusually high win rates
  // For games like Baccarat, win rates significantly above 50% are suspicious
  if (winRate > 0.65 && totalRounds >= 20) {
    result.detected = true;
    result.riskScore = Math.min(60, Math.round((winRate - 0.65) * 300)); // Higher win rate = higher risk score
    result.explanation = `Unusually high win rate of ${Math.round(winRate * 100)}% over ${totalRounds} rounds`;
  }
  
  return result;
}

/**
 * Detects unusual patterns in side bet usage that might indicate insider knowledge
 * @param {Object} playerData - Player betting data
 * @returns {Object} - Detection result
 */
function detectSideBetManipulation(playerData) {
  const result = {
    patternName: 'Side Bet Manipulation',
    detected: false,
    riskScore: 0,
    explanation: ''
  };
  
  // Check if player has side bet data
  if (!playerData.sideBets || Object.keys(playerData.sideBets).length === 0) {
    return result;
  }
  
  let sideBetWinRate = 0;
  let totalSideBets = 0;
  let sideBetWins = 0;
  
  // Calculate side bet win rate
  Object.keys(playerData.sideBets).forEach(betType => {
    const betData = playerData.sideBets[betType];
    totalSideBets += betData.count || 0;
    sideBetWins += betData.wins || 0;
  });
  
  if (totalSideBets > 0) {
    sideBetWinRate = sideBetWins / totalSideBets;
  }
  
  // Side bets typically have lower win rates, so high win rates are suspicious
  if (sideBetWinRate > 0.3 && totalSideBets >= 10) {
    result.detected = true;
    result.riskScore = Math.min(40, Math.round((sideBetWinRate - 0.3) * 200));
    result.explanation = `Unusual side bet win rate of ${Math.round(sideBetWinRate * 100)}% over ${totalSideBets} side bets`;
  }
  
  return result;
}

/**
 * Detects win streaks immediately after a long break, which can be suspicious
 * @param {Object} playerData - Player betting data
 * @returns {Object} - Detection result
 */
function detectWinStreakAfterBreak(playerData) {
  const result = {
    patternName: 'Win Streak After Break',
    detected: false,
    riskScore: 0,
    explanation: ''
  };

  const rounds = playerData.rounds;
  if (!rounds || rounds.length < 5) return result;

  const LONG_BREAK_MS = 30 * 60 * 1000; // 30 minutes
  const WIN_STREAK_MIN = 3; // Minimum win streak after break

  for (let i = 1; i < rounds.length - WIN_STREAK_MIN + 1; i++) {
    if (rounds[i].timestamp && rounds[i-1].timestamp) {
      const timeDiff = Math.abs(new Date(rounds[i].timestamp) - new Date(rounds[i-1].timestamp));
      if (timeDiff >= LONG_BREAK_MS) {
        // Check for win streak after break
        let winStreak = 0;
        let j = i;
        while (j < rounds.length && rounds[j].netEUR > 0) {
          winStreak++;
          j++;
        }
        if (winStreak >= WIN_STREAK_MIN) {
          result.detected = true;
          result.riskScore += 25 + 5 * (winStreak - WIN_STREAK_MIN); // More for longer streaks
          result.explanation = `Win streak of ${winStreak} immediately after a long break (${Math.round(timeDiff/60000)} min)`;
          break; // Only flag the first occurrence
        }
      }
    }
  }

  return result;
}

/**
 * Detects dynamic patterns of break → high win → break → high win, etc.
 * @param {Object} playerData - Player betting data
 * @returns {Object} - Detection result
 */
function detectBreakHighWinPattern(playerData) {
  const result = {
    patternName: 'Break-High Win Alternating Pattern',
    detected: false,
    riskScore: 0,
    explanation: ''
  };

  const rounds = playerData.rounds;
  if (!rounds || rounds.length < 5) return result;

  const BREAK_MS = 15 * 60 * 1000; // 15 minutes
  const HIGH_WIN_THRESHOLD = 2 * (playerData.avgBetEUR || 10); // High win: 2x average bet, fallback 10
  let patternCount = 0;
  let i = 1;

  while (i < rounds.length) {
    // Look for a break
    if (rounds[i].timestamp && rounds[i-1].timestamp) {
      const timeDiff = Math.abs(new Date(rounds[i].timestamp) - new Date(rounds[i-1].timestamp));
      if (timeDiff >= BREAK_MS) {
        // After break, look for high win
        if (rounds[i].netEUR >= HIGH_WIN_THRESHOLD) {
          patternCount++;
          // Skip to next possible break after this win
          i++;
          while (i < rounds.length && rounds[i].netEUR >= HIGH_WIN_THRESHOLD) i++;
          continue;
        }
      }
    }
    i++;
  }

  if (patternCount >= 2) {
    result.detected = true;
    result.riskScore = 30 + 10 * (patternCount - 2); // More for more patterns
    result.explanation = `Detected ${patternCount} alternating break → high win patterns (break ≥ 15 min, win ≥ ${HIGH_WIN_THRESHOLD} EUR)`;
  }

  return result;
}

/**
 * Detects if there is a low round count with high average bets
 * @param {Object} playerData - Player betting data
 * @returns {Object} - Detection result
 */
function detectLowRoundHighBet(playerData) {
  const result = {
    patternName: 'Low Round Count with High Bets',
    detected: false,
    riskScore: 0,
    explanation: ''
  };

  const rounds = playerData.rounds;
  if (!rounds || rounds.length === 0) return result;

  const LOW_ROUND_THRESHOLD = 8; // e.g., less than 8 rounds
  const HIGH_BET_THRESHOLD = 100; // e.g., average bet over 100 EUR (adjust as needed)

  // Calculate average bet
  let totalBet = 0;
  rounds.forEach(round => {
    totalBet += round.betEUR || 0;
  });
  const avgBet = totalBet / rounds.length;

  if (rounds.length < LOW_ROUND_THRESHOLD && avgBet >= HIGH_BET_THRESHOLD) {
    result.detected = true;
    result.riskScore = 35;
    result.explanation = `Low round count (${rounds.length}) with high average bet (${avgBet.toFixed(2)} EUR)`;
  }

  return result;
}

/**
 * Formats the fraud detection results for display
 * @param {Object} results - Fraud detection results
 * @returns {String} - HTML formatted string for display
 */
function formatFraudDetectionResults(results) {
  if (!results.detectedPatterns || results.detectedPatterns.length === 0) {
    return '<p class="Fraud in-line highlight-h">Fraud pattern not detected</p>';
  }

  const riskLevelClass = `risk-level-${results.riskLevel}`;
  let icon = '';
  if (results.riskLevel === 'low') {
    icon = '<img src="img/icons8-fire-cool.gif" alt="Low Risk" style="height: 24px; vertical-align: middle; margin-left: 8px;">';
  } else if (results.riskLevel === 'medium') {
    icon = '<img src="img/icons8-fire.gif" alt="Medium Risk" style="height: 24px; vertical-align: middle; margin-left: 8px;">';
  } else if (results.riskLevel === 'high' || results.riskLevel === 'critical') {
    icon = '<img src="img/icons8-fire-nova.gif" alt="High Risk" style="height: 24px; vertical-align: middle; margin-left: 8px;">';
  }

  return `
    <div class="fraud-detection-results ${riskLevelClass}">
      <p class="Fraud in-line highlight-h" style="color: ${results.color}">
        <strong>Risk Level: ${results.riskLevel.toUpperCase()}</strong> (Score: ${results.riskScore})${icon}
      </p>
    </div>
  `;
}

// Export functions for use in application.js
window.FraudDetection = {
  detectFraudPatterns,
  formatFraudDetectionResults
};
