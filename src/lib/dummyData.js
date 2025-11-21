// Dummy data generator for 30 classrooms
// Each classroom has varied power consumption patterns
// Data updates every time it's called (uses current time for variation)

const CLASSROOMS_COUNT = 30;

// Seed-based pseudo-random for consistent classroom data
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate dummy data for a specific classroom
// Data changes every time based on current timestamp
export function generateDummyClassroomData(classroomId) {
  const seed = classroomId * 12345;
  const timeSeed = Math.floor(Date.now() / 1000); // Updates every second
  
  // Each classroom has a slightly different base power and variance
  const baseMultiplier = 0.5 + seededRandom(seed) * 1.5; // 0.5x to 2x
  const variance = 100 + seededRandom(seed + 1) * 300; // 100-400W variance

  // Generate hourly data for today (1d) with time-based variation
  const todayData = Array.from({ length: 24 }, (_, hour) => {
    // Combine hour seed with current time seed for dynamic variation
    const randomFactor = seededRandom(seed + hour + 2 + timeSeed);
    const basePower = 500 * baseMultiplier;
    const power = Math.floor(basePower + (randomFactor - 0.5) * variance);
    
    return {
      hour,
      power: Math.max(100, power), // Min 100W
      current: Math.floor((power / 230) * 1000), // Convert to mA (assuming 230V)
      voltage: 230 + seededRandom(seed + hour + 100 + timeSeed) * 10 - 5, // 225-235V
      date: new Date().toISOString().split('T')[0],
    };
  });

  // Generate daily data for last 7 days with time-based variation
  const weekData = Array.from({ length: 7 }, (_, day) => {
    const avgRandomFactor = Array.from({ length: 24 }, (_, h) => 
      seededRandom(seed + day * 100 + h + timeSeed)
    ).reduce((a, b) => a + b, 0) / 24;
    
    const basePower = 500 * baseMultiplier;
    const dailyPower = Math.floor(basePower + (avgRandomFactor - 0.5) * variance);
    const date = new Date();
    date.setDate(date.getDate() - (6 - day));

    return {
      date: date.toISOString().split('T')[0],
      power: Math.max(100, dailyPower),
      current: Math.floor((dailyPower / 230) * 1000),
      voltage: 230 + seededRandom(seed + day + 200 + timeSeed) * 10 - 5,
    };
  });

  // Generate daily data for last 30 days with time-based variation
  const monthData = Array.from({ length: 30 }, (_, day) => {
    const avgRandomFactor = Array.from({ length: 24 }, (_, h) => 
      seededRandom(seed + (day + 1) * 1000 + h + timeSeed)
    ).reduce((a, b) => a + b, 0) / 24;
    
    const basePower = 500 * baseMultiplier;
    const dailyPower = Math.floor(basePower + (avgRandomFactor - 0.5) * variance);
    const date = new Date();
    date.setDate(date.getDate() - (29 - day));

    return {
      date: date.toISOString().split('T')[0],
      power: Math.max(100, dailyPower),
      current: Math.floor((dailyPower / 230) * 1000),
      voltage: 230 + seededRandom(seed + day + 300 + timeSeed) * 10 - 5,
    };
  });

  return {
    success: true,
    classroomId,
    classroomName: `Classroom ${classroomId}`,
    data: {
      today: todayData,
      week: weekData,
      month: monthData,
    },
  };
}

// Get current live data for a classroom
export function getDummyLiveData(classroomId) {
  const seed = classroomId * 12345;
  const baseMultiplier = 0.5 + seededRandom(seed) * 1.5;
  const variance = 100 + seededRandom(seed + 1) * 300;
  const randomFactor = seededRandom(Date.now() / 1000 + classroomId);
  
  const basePower = 500 * baseMultiplier;
  const power = Math.floor(basePower + (randomFactor - 0.5) * variance);
  
  return {
    classroom: classroomId,
    time: new Date().toISOString(),
    power: Math.max(100, power),
    current: Math.floor((power / 230) * 1000),
    voltage: 230 + seededRandom(Date.now() / 1000 + classroomId + 100) * 10 - 5,
  };
}
