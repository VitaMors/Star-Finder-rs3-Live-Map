// Test data to simulate Discord announcements
// You can use this in browser console to test the map

function testStarData() {
  // Simulate upcoming stars
  const upcomingStars = [
    {
      world: 75,
      size: 10,
      region: "Asgarnia",
      etaISO: new Date(Date.now() + 5 * 60000).toISOString(), // 5 minutes from now
      status: "upcoming"
    },
    {
      world: 123,
      size: 8,
      region: "Wilderness", 
      etaISO: new Date(Date.now() + 15 * 60000).toISOString(), // 15 minutes from now
      status: "upcoming"
    }
  ];

  // Simulate current stars
  const currentStars = [
    {
      world: 456,
      size: 6,
      region: "Kandarin",
      etaISO: new Date(Date.now() - 2 * 60000).toISOString(), // 2 minutes ago
      status: "current"
    }
  ];

  console.log("Test upcoming stars:", upcomingStars);
  console.log("Test current stars:", currentStars);
  
  return { upcomingStars, currentStars };
}

// Call this function in browser console to test
window.testStarData = testStarData;
