import { container } from '@src/container'

describe('Dependency Injection Container', () => {
  beforeEach(() => {
    container.clear(); // Clear the container before each test
  });

  it('should register and retrieve a dependency', () => {
    const dependency = { name: 'TestDependency' };
    container.register('TestDependency', dependency);

    const resolvedDependency = container.get('TestDependency');
    expect(resolvedDependency).toBe(dependency);
  });

  it('should throw an error when retrieving a non-existent dependency', () => {
    expect(() => container.get('NonExistentDependency')).toThrow(
      "Dependency 'NonExistentDependency' not found"
    );
  });

  it('should not overwrite an existing dependency when registering with the same name', () => {
    const dependency1 = { name: 'Dependency1' };
    const dependency2 = { name: 'Dependency2' };

    container.register('TestDependency', dependency1);
    container.register('TestDependency', dependency2);

    const resolvedDependency = container.get('TestDependency');
    expect(resolvedDependency).toBe(dependency1); // Should still be the first dependency
  });

  it('should override an existing dependency', () => {
    const dependency1 = { name: 'Dependency1' };
    const dependency2 = { name: 'Dependency2' };

    container.register('TestDependency', dependency1);
    container.override('TestDependency', dependency2);

    const resolvedDependency = container.get('TestDependency');
    expect(resolvedDependency).toBe(dependency2); // Should now be the overridden dependency
  });

  it('should clear all dependencies', () => {
    const dependency = { name: 'TestDependency' };
    container.register('TestDependency', dependency);

    container.clear();

    expect(() => container.get('TestDependency')).toThrow(
      "Dependency 'TestDependency' not found"
    );
  });

  it('should check if a dependency exists', () => {
    const dependency = { name: 'TestDependency' };
    container.register('TestDependency', dependency);

    expect(container.has('TestDependency')).toBe(true);
    expect(container.has('NonExistentDependency')).toBe(false);
  });

  it('should throw an error when overriding a non-existent dependency', () => {
    const dependency = { name: 'NewDependency' };

    expect(() => container.override('NonExistentDependency', dependency)).toThrow();
  });
});