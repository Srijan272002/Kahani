export class ExperimentMetrics {
  constructor(db) {
    this.db = db;
  }

  async calculateConversionRate(experimentName, variant) {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(DISTINCT user_id) as total_users,
        COUNT(DISTINCT CASE WHEN event_name = 'conversion' THEN user_id END) as converted_users
      FROM experiment_events
      WHERE experiment_name = ? AND variant = ?
    `);

    const { total_users, converted_users } = stmt.get(experimentName, variant);
    return total_users ? converted_users / total_users : 0;
  }

  async calculateEngagementMetrics(experimentName, variant) {
    const stmt = this.db.prepare(`
      SELECT 
        AVG(CASE WHEN event_name = 'time_spent' THEN value END) as avg_time_spent,
        AVG(CASE WHEN event_name = 'interactions' THEN value END) as avg_interactions,
        COUNT(DISTINCT user_id) as unique_users
      FROM experiment_events
      WHERE experiment_name = ? AND variant = ?
    `);

    return stmt.get(experimentName, variant);
  }

  async getStatisticalSignificance(experimentName) {
    // Implement chi-square test for statistical significance
    const variants = await this.getExperimentVariants(experimentName);
    const metrics = await Promise.all(
      variants.map(async variant => ({
        variant,
        metrics: await this.calculateAllMetrics(experimentName, variant)
      }))
    );

    return this.calculateSignificance(metrics);
  }

  async getExperimentVariants(experimentName) {
    const stmt = this.db.prepare(`
      SELECT DISTINCT variant 
      FROM experiment_assignments 
      WHERE experiment_name = ?
    `);
    
    return stmt.all(experimentName).map(row => row.variant);
  }

  async calculateAllMetrics(experimentName, variant) {
    const [conversionRate, engagementMetrics] = await Promise.all([
      this.calculateConversionRate(experimentName, variant),
      this.calculateEngagementMetrics(experimentName, variant)
    ]);

    return {
      conversionRate,
      ...engagementMetrics
    };
  }

  calculateSignificance(metrics) {
    // Implement chi-square test
    const chiSquare = this.calculateChiSquare(metrics);
    const pValue = this.calculatePValue(chiSquare, metrics.length - 1);

    return {
      chiSquare,
      pValue,
      isSignificant: pValue < 0.05
    };
  }

  calculateChiSquare(metrics) {
    // Simple chi-square implementation
    const expected = metrics.reduce((sum, m) => sum + m.metrics.unique_users, 0) / metrics.length;
    return metrics.reduce((sum, m) => {
      const observed = m.metrics.unique_users;
      return sum + Math.pow(observed - expected, 2) / expected;
    }, 0);
  }

  calculatePValue(chiSquare, degreesOfFreedom) {
    // Simple p-value approximation
    return 1 - this.chiSquareCDF(chiSquare, degreesOfFreedom);
  }

  chiSquareCDF(x, k) {
    // Approximation of chi-square cumulative distribution function
    const t = x / 2;
    let sum = Math.exp(-t);
    for (let i = 1; i < k; i++) {
      sum += Math.exp(-t) * Math.pow(t, i) / this.factorial(i);
    }
    return Math.max(0, 1 - sum);
  }

  factorial(n) {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }
}