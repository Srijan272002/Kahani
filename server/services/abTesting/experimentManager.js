export class ExperimentManager {
  constructor() {
    this.experiments = new Map();
    this.userAssignments = new Map();
  }

  registerExperiment(name, variants, weights = null) {
    this.experiments.set(name, {
      variants,
      weights: weights || variants.map(() => 1 / variants.length)
    });
  }

  assignUserToVariant(userId, experimentName) {
    const key = `${userId}-${experimentName}`;
    
    if (this.userAssignments.has(key)) {
      return this.userAssignments.get(key);
    }

    const experiment = this.experiments.get(experimentName);
    if (!experiment) {
      throw new Error(`Experiment ${experimentName} not found`);
    }

    const variant = this.selectVariant(experiment.variants, experiment.weights);
    this.userAssignments.set(key, variant);
    
    return variant;
  }

  selectVariant(variants, weights) {
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < variants.length; i++) {
      sum += weights[i];
      if (random < sum) {
        return variants[i];
      }
    }
    
    return variants[variants.length - 1];
  }

  trackEvent(userId, experimentName, eventName, value = 1) {
    // Implementation for tracking experiment events
    // This would typically integrate with an analytics service
    console.log(`Tracked event ${eventName} for user ${userId} in experiment ${experimentName}`);
  }
}