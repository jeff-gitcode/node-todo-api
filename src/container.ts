type DependencyMap = {
  [key: string]: any;
};

const bind: DependencyMap = {};

export const container = {
  register<T = any>(name: string, dependency: T) {
    bind[name] ??= dependency;
  },

  get<T = any>(name: string): T {
    if (!bind[name]) {
      throw new Error(`Dependency '${name}' not found`);
    }
    return bind[name];
  },

  override<T>(name: string, dependency: T): void {
    bind[name] = dependency; // For tests or force-replace
  },

  clear(): void {
    for (const key in bind) {
      delete bind[key];
    }
  },

  has(name: string): boolean {
    return name in bind;
  }
};