// ==================== RANDOM EVENTS & BOSS FIGHTS ====================

const RandomEvents = {
  lastEvent: 0,
  eventCooldown: 15000,
  
  events: {},
  
  trigger(level, game) {
    return false;
  }
};

const BossFights = {
  active: false,
  bosses: {},
  
  checkSpawn(level, game) {
    return false;
  }
};

window.RandomEvents = RandomEvents;
window.BossFights = BossFights;
